"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Trash2, GripVertical, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAdminHero, updateAdminHero, uploadAdminImage } from "@/services/adminApi";

export default function AdminHeroPage() {
  const [slides, setSlides] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  useEffect(() => {
    const loadHero = async () => {
      try {
        setLoading(true);
        const hero = await getAdminHero();
        if (hero) {
          setSlides(hero.slides || []);
          setIsActive(hero.isActive !== false);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load hero data");
      } finally {
        setLoading(false);
      }
    };

    loadHero();
  }, []);

  const handleAddSlide = () => {
    setSlides([...slides, { image: '', subtitle: '', title: '', description: '', link: '/products' }]);
  };

  const handleRemoveSlide = (index) => {
    const newSlides = [...slides];
    newSlides.splice(index, 1);
    setSlides(newSlides);
  };

  const onFieldChange = (index, field, value) => {
    const newSlides = [...slides];
    newSlides[index][field] = value;
    setSlides(newSlides);
  };

  const onUploadImage = async (event, index) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingIndex(index);
      const imageUrl = await uploadAdminImage(file);
      if (!imageUrl) {
        toast.error("Upload failed. Please add URL manually.");
        return;
      }

      onFieldChange(index, "image", imageUrl);
      toast.success("Image uploaded");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingIndex(null);
      event.target.value = "";
    }
  };

  const onSave = async (event) => {
    event.preventDefault();

    const invalid = slides.some(slide => !slide.title || !slide.image);
    if (invalid) {
      toast.error("Please fill Title and Image for all slides");
      return;
    }

    const payload = {
      slides: slides.map((s) => ({
        image: (s.image || '').trim(),
        subtitle: (s.subtitle || '').trim(),
        title: (s.title || '').trim(),
        description: (s.description || '').trim(),
        link: (s.link || '/products').trim(),
      })),
      isActive,
    };

    try {
      setSaving(true);
      const updated = await updateAdminHero(payload);
      setSlides(updated.slides || []);
      setIsActive(updated.isActive !== false);
      toast.success("Hero sections updated");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save hero sections");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-dark-text dark:text-cream" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-serif text-dark-text dark:text-cream">Luxury Hero Slider</h1>
        <button
          onClick={handleAddSlide}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          Add Slide
        </button>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        {slides.length === 0 ? (
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-black/5 dark:border-white/10 p-12 text-center">
            <p className="text-gray-500">No slides found. Click "Add Slide" to begin.</p>
          </div>
        ) : (
          slides.map((slide, index) => (
            <div key={index} className="bg-white dark:bg-dark-card rounded-2xl border border-black/5 dark:border-white/10 p-5 sm:p-6 mb-4 relative">
              
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveSlide(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Slide"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <GripVertical size={20} className="text-gray-400 cursor-move" />
                <h3 className="text-lg font-medium">Slide {index + 1}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Section */}
                <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 sm:items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Background Image URL *</label>
                    <input
                      type="text"
                      value={slide.image}
                      onChange={(e) => onFieldChange(index, "image", e.target.value)}
                      placeholder="https://..."
                      className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="flex items-center justify-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-lg font-medium transition-colors h-[42px]">
                      {uploadingIndex === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span className="text-sm">{uploadingIndex === index ? "Uploading..." : "Upload Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onUploadImage(e, index)}
                        disabled={uploadingIndex !== null}
                      />
                    </label>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtitle (Top label)</label>
                  <input
                    type="text"
                    value={slide.subtitle}
                    onChange={(e) => onFieldChange(index, "subtitle", e.target.value)}
                    placeholder="THE NEW STANDARD"
                    className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2 uppercase"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Main Title *</label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => onFieldChange(index, "title", e.target.value)}
                    placeholder="WORK HOUR"
                    className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2 uppercase"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    value={slide.description}
                    onChange={(e) => onFieldChange(index, "description", e.target.value)}
                    rows={2}
                    placeholder="Structure meets fluidity in our latest collection."
                    className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Button Link</label>
                  <input
                    type="text"
                    value={slide.link}
                    onChange={(e) => onFieldChange(index, "link", e.target.value)}
                    placeholder="/products"
                    className="mt-1 w-full rounded-lg border border-gray-300 dark:border-white/10 bg-transparent px-4 py-2"
                  />
                </div>

                {/* Preview Image if Available */}
                {slide.image && (
                  <div className="md:col-span-2 mt-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Preview:</p>
                    <div className="relative w-full max-w-sm aspect-[4/3] rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={slide.image}
                        alt="Slide Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div className="flex items-center justify-between bg-white dark:bg-dark-card rounded-2xl border border-black/5 dark:border-white/10 p-5 sm:p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-theme-accent"></div>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isActive ? "Hero is Visible" : "Hero is Hidden"}
            </span>
          </label>

          <button
            type="submit"
            disabled={saving || uploadingIndex !== null}
            className="px-6 py-2.5 bg-theme-accent hover:bg-[#b0956f] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
