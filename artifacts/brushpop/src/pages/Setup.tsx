import { useState, useRef, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Camera, Upload, Trash2 } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";
import { KidProfile } from "@/lib/types";
import { processImageFile } from "@/lib/imageUtils";

export default function Setup() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const isEditing = !!params.id;

  const { profiles, saveProfile, deleteProfile, getProfile } = useProfiles();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [surpriseMode, setSurpriseMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && params.id) {
      const profile = getProfile(params.id);
      if (profile) {
        setName(profile.name);
        setImage(profile.imageBase64);
        setSurpriseMode(profile.surpriseMode);
      } else {
        setLocation("/");
      }
    }
  }, [isEditing, params.id, profiles]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await processImageFile(file);
      setImage(base64);
    } catch (err) {
      console.error(err);
      alert("Failed to process image");
    }
  };

  const handleSave = () => {
    if (!name.trim()) { alert("Please enter a name"); return; }
    if (!image) { alert("Please upload a surprise image"); return; }

    const profile: KidProfile = {
      id: isEditing ? params.id! : crypto.randomUUID(),
      name: name.trim(),
      imageBase64: image,
      theme: "blast-off" as any,
      surpriseMode,
      createdAt: isEditing ? getProfile(params.id!)!.createdAt : Date.now(),
    };

    saveProfile(profile);
    setLocation("/");
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this profile?")) {
      deleteProfile(params.id!);
      setLocation("/");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-transparent max-w-md mx-auto relative flex flex-col"
    >
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => setLocation("/")} className="p-2 rounded-full hover:bg-muted">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-black">{isEditing ? "Edit BrushPop" : "New BrushPop"}</h1>
        <div className="w-10" />
      </div>

      <div className="p-6 flex-1 flex flex-col gap-8">

        {/* Name */}
        <div>
          <label className="block text-xs font-black text-muted-foreground mb-2 uppercase tracking-widest">
            Kid's Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter their name…"
            data-testid="input-name"
            className="w-full text-2xl font-black border-b-2 border-muted focus:border-primary outline-none bg-transparent py-2 transition-colors placeholder:text-muted/60"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-xs font-black text-muted-foreground mb-2 uppercase tracking-widest">
            Tonight's Surprise 🎁
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            data-testid="upload-image"
            className="w-full aspect-square bg-white rounded-3xl border-4 border-dashed border-primary/20 flex flex-col items-center justify-center overflow-hidden cursor-pointer relative hover:border-primary/40 transition-colors"
          >
            {image ? (
              <>
                <img src={image} alt="Surprise" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-2">
                  <Camera className="text-white w-10 h-10" />
                  <span className="text-white font-bold text-sm">Change photo</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 px-8 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-9 h-9 text-primary" />
                </div>
                <div>
                  <p className="font-black text-foreground text-lg">Upload a photo</p>
                  <p className="text-muted-foreground text-sm mt-1 leading-snug">
                    This stays hidden until they finish brushing! 🤫
                  </p>
                </div>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Keep it secret / Surprise Mode */}
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-black text-foreground">Keep it secret 🤫</h3>
            <p className="text-xs text-muted-foreground leading-snug mt-1">
              Hide the photo preview so it's a complete surprise when they brush.
            </p>
          </div>
          <button
            onClick={() => setSurpriseMode(!surpriseMode)}
            data-testid="toggle-surprise-mode"
            className={`w-14 h-8 rounded-full p-1 transition-colors flex-shrink-0 ${
              surpriseMode ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                surpriseMode ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

      </div>

      {/* Save */}
      <div className="p-6 sticky bottom-0 bg-white/70 backdrop-blur-md pb-8">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          data-testid="button-save"
          className="w-full bg-primary text-white text-xl font-black py-5 rounded-full shadow-[0_6px_0_hsl(355,85%,45%)] active:translate-y-1.5 active:shadow-[0_2px_0_hsl(355,85%,45%)] transition-all"
        >
          {isEditing ? "Save Changes" : "Save BrushPop 🎉"}
        </motion.button>
        {isEditing && (
          <button
            onClick={handleDelete}
            data-testid="button-delete"
            className="w-full mt-4 text-destructive font-bold py-2 flex justify-center items-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" /> Delete Profile
          </button>
        )}
      </div>
    </motion.div>
  );
}
