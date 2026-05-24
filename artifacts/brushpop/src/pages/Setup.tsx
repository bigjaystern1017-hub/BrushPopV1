import { useState, useRef, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Camera, Upload, Trash2 } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";
import { WallTheme, KidProfile } from "@/lib/types";
import { processImageFile } from "@/lib/imageUtils";

const THEMES: { id: WallTheme; name: string; color: string; icon: string }[] = [
  { id: "space", name: "Space", color: "#1a1a2e", icon: "🚀" },
  { id: "jungle", name: "Jungle", color: "#2d6a4f", icon: "🌿" },
  { id: "underwater", name: "Underwater", color: "#0077b6", icon: "🐟" },
  { id: "playground", name: "Playground", color: "#e63946", icon: "🎈" },
  { id: "graffiti", name: "Graffiti", color: "#6c757d", icon: "🎨" },
  { id: "fantasy", name: "Fantasy", color: "#b0bec5", icon: "🏰" },
];

export default function Setup() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const isEditing = !!params.id;
  
  const { profiles, saveProfile, deleteProfile, getProfile } = useProfiles();
  
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [theme, setTheme] = useState<WallTheme>("space");
  const [surpriseMode, setSurpriseMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && params.id) {
      const profile = getProfile(params.id);
      if (profile) {
        setName(profile.name);
        setImage(profile.imageBase64);
        setTheme(profile.theme);
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
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }
    if (!image) {
      alert("Please upload a hidden image");
      return;
    }
    
    const profile: KidProfile = {
      id: isEditing ? params.id! : crypto.randomUUID(),
      name: name.trim(),
      imageBase64: image,
      theme,
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
      className="min-h-screen bg-background max-w-md mx-auto relative flex flex-col"
    >
      <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => setLocation("/")} className="p-2 rounded-full hover:bg-muted">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">{isEditing ? "Edit Profile" : "New Kid"}</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-8">
        
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Name</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Kid's name"
            className="w-full text-2xl font-bold border-b-2 border-muted focus:border-primary outline-none bg-transparent py-2 transition-colors"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Hidden Image</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square bg-white rounded-3xl border-4 border-dashed border-muted flex flex-col items-center justify-center overflow-hidden cursor-pointer relative"
          >
            {image ? (
              <>
                <img src={image} alt="Hidden" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="text-white w-10 h-10" />
                </div>
              </>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-3">
                <div className="p-4 bg-muted rounded-full">
                  <Upload className="w-8 h-8" />
                </div>
                <span className="font-bold">Upload a photo</span>
                <span className="text-sm px-8 text-center">This will be revealed when they finish brushing!</span>
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

        {/* Wall Theme */}
        <div>
          <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Wall Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(t => (
              <div 
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`rounded-2xl p-3 cursor-pointer border-4 transition-all flex flex-col items-center gap-2 ${theme === t.id ? 'border-primary scale-105 shadow-md' : 'border-transparent bg-white shadow-sm'}`}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner" style={{ backgroundColor: t.color }}>
                  {t.icon}
                </div>
                <span className="text-xs font-bold">{t.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Surprise Mode */}
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <h3 className="font-bold">Surprise Mode 🎁</h3>
            <p className="text-sm text-muted-foreground leading-tight mt-1">Hide the image on the select screen so it's a total surprise.</p>
          </div>
          <button 
            onClick={() => setSurpriseMode(!surpriseMode)}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${surpriseMode ? 'bg-primary' : 'bg-muted'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${surpriseMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

      </div>

      <div className="p-6 sticky bottom-0 bg-background/80 backdrop-blur-md pb-safe">
        <button 
          onClick={handleSave}
          className="w-full bg-primary text-white text-xl font-bold py-4 rounded-full shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          Save
        </button>
        {isEditing && (
          <button 
            onClick={handleDelete}
            className="w-full mt-4 text-destructive font-bold py-2 flex justify-center items-center gap-2"
          >
            <Trash2 className="w-5 h-5" /> Delete Profile
          </button>
        )}
      </div>
    </motion.div>
  );
}
