$ErrorActionPreference = 'Stop'

$baseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { 'http://localhost:5000' }
$testEmail = if ($env:SMOKE_EMAIL) { $env:SMOKE_EMAIL } else { 'admin.smoke@amcrochet.test' }
$testPassword = if ($env:SMOKE_PASSWORD) { $env:SMOKE_PASSWORD } else { 'Admin@12345' }
$couponCode = if ($env:SMOKE_COUPON) { $env:SMOKE_COUPON } else { 'SMOKE10' }

function Invoke-Json {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $false)]$Body,
    [Parameter(Mandatory = $false)][hashtable]$Headers
  )

  $params = @{
    Method = $Method
    Uri = $Url
    ContentType = 'application/json'
  }

  if ($Body -ne $null) {
    $params.Body = ($Body | ConvertTo-Json -Depth 10)
  }

  if ($Headers) {
    $params.Headers = $Headers
  }

  try {
    return Invoke-RestMethod @params
  }
  catch {
    if ($_.Exception.Response) {
      $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
      $responseBody = $reader.ReadToEnd()
      throw "Request failed [$Method $Url]: $responseBody"
    }

    throw
  }
}

Write-Host "[1/11] Health check"
$health = Invoke-Json -Method 'GET' -Url "$baseUrl/api/health"
Write-Host "Health:" ($health | ConvertTo-Json -Compress)

Write-Host "[2/11] Register smoke admin user (safe if already exists)"
try {
  $null = Invoke-Json -Method 'POST' -Url "$baseUrl/api/auth/register" -Body @{
    name = 'Smoke Admin'
    email = $testEmail
    password = $testPassword
  }
}
catch {
  Write-Host "Register skipped/failed (likely existing user): $($_.Exception.Message)"
}

Write-Host "[3/11] Promote smoke user to admin in DB"
$promoteScript = @"
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.updateOne({ email: '$testEmail' }, { $set: { role: 'admin' } });
  await mongoose.disconnect();
  console.log('USER_PROMOTED');
})();
"@
node -e $promoteScript | Out-Null

Write-Host "[4/11] Login as smoke admin"
$login = Invoke-Json -Method 'POST' -Url "$baseUrl/api/auth/login" -Body @{
  email = $testEmail
  password = $testPassword
}
$token = $login.data.token
if (-not $token) { throw 'Login did not return token' }
$authHeader = @{ Authorization = "Bearer $token" }

Write-Host "[5/11] Create product"
$product = Invoke-Json -Method 'POST' -Url "$baseUrl/api/products" -Headers $authHeader -Body @{
  name = "Smoke Test Bag $(Get-Date -Format 'yyyyMMddHHmmss')"
  price = 1499
  category = 'travel'
  description = 'Smoke test product'
  image = 'https://example.com/bag.webp'
  stock = 10
}
$productId = $product.data._id
if (-not $productId) { throw 'Product creation did not return _id' }

Write-Host "[6/11] Add product to cart"
$null = Invoke-Json -Method 'POST' -Url "$baseUrl/api/cart" -Headers $authHeader -Body @{
  productId = $productId
  quantity = 2
}

Write-Host "[7/11] Create coupon (admin)"
$expiry = (Get-Date).AddDays(7).ToString('o')
try {
  $null = Invoke-Json -Method 'POST' -Url "$baseUrl/api/coupons" -Headers $authHeader -Body @{
    code = $couponCode
    discountType = 'percentage'
    discount = 10
    minAmount = 500
    expiryDate = $expiry
    isActive = $true
  }
}
catch {
  Write-Host "Coupon creation skipped/failed (likely existing code): $($_.Exception.Message)"
}

Write-Host "[8/11] Apply coupon"
$appliedCoupon = Invoke-Json -Method 'POST' -Url "$baseUrl/api/coupons/apply" -Headers $authHeader -Body @{
  code = $couponCode
  amount = 2998
}
Write-Host "Coupon result:" ($appliedCoupon | ConvertTo-Json -Compress)

Write-Host "[9/11] Create order"
$orderCreate = Invoke-Json -Method 'POST' -Url "$baseUrl/api/orders/create" -Headers $authHeader -Body @{
  couponCode = $couponCode
}
$razorpayOrderId = $orderCreate.data.razorpayOrderId
if (-not $razorpayOrderId) { throw 'Order create did not return razorpayOrderId' }

Write-Host "[10/11] Verify payment (signature simulation for backend flow test)"
$fakePaymentId = "pay_smoke_$(Get-Date -Format 'yyyyMMddHHmmss')"
$signatureScript = @"
const crypto = require('crypto');
const secret = process.env.RAZORPAY_KEY_SECRET;
const orderId = '$razorpayOrderId';
const paymentId = '$fakePaymentId';
const sig = crypto.createHmac('sha256', secret).update(orderId + '|' + paymentId).digest('hex');
console.log(sig);
"@
$signature = (node -e $signatureScript).Trim()

$verify = Invoke-Json -Method 'POST' -Url "$baseUrl/api/orders/verify" -Headers $authHeader -Body @{
  razorpay_order_id = $razorpayOrderId
  razorpay_payment_id = $fakePaymentId
  razorpay_signature = $signature
}
Write-Host "Verify result:" ($verify | ConvertTo-Json -Compress)

Write-Host "[11/11] Fetch user orders"
$orders = Invoke-Json -Method 'GET' -Url "$baseUrl/api/orders" -Headers $authHeader
Write-Host "Orders result count:" $orders.data.Count

Write-Host 'PHASE_5_SMOKE_TEST_COMPLETED'
