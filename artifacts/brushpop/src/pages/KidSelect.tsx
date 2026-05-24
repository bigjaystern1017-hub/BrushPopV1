import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Plus, Trophy, Settings, Sparkles } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";

export default function KidSelect() {
  const { profiles } = useProfiles();
  const [, setLocation] = useLocation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-background p-6 flex flex-col items-center max-w-md mx-auto"
    >
      <div className="w-full text-center mt-8 mb-12">
        <h1 className="text-4xl font-black text-primary flex items-center justify-center gap-2">
          BrushPop <Sparkles className="text-secondary w-8 h-8" />
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">Who is brushing today?</p>
      </div>

      {profiles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 w-full">
          <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
            <span className="text-5xl">🦷</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to BrushPop!</h2>
          <p className="text-muted-foreground mb-8">Add a kid to start the brushing magic.</p>
          <button 
            onClick={() => setLocation('/setup')}
            className="bg-primary text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform w-full"
          >
            Add Kid
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            {profiles.map(profile => (
              <motion.div 
                key={profile.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-3xl shadow-md overflow-hidden relative cursor-pointer group border-2 border-transparent hover:border-primary transition-colors"
                onClick={() => setLocation(`/brush/${profile.id}`)}
              >
                <div className="aspect-square relative overflow-hidden bg-muted flex items-center justify-center">
                  {profile.imageBase64 && !profile.surpriseMode ? (
                     <img src={profile.imageBase64} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl font-black text-primary opacity-50">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <h3 className="absolute bottom-3 left-3 text-white font-bold text-xl">{profile.name}</h3>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-white">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setLocation(`/collection/${profile.id}`); }}
                    className="p-2 bg-secondary/20 text-secondary rounded-full hover:bg-secondary hover:text-white transition-colors"
                  >
                    <Trophy className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setLocation(`/setup/${profile.id}`); }}
                    className="p-2 bg-muted text-muted-foreground rounded-full hover:bg-muted-foreground hover:text-white transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation('/setup')}
              className="bg-muted rounded-3xl border-4 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer min-h-[200px]"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 text-primary shadow-sm">
                <Plus className="w-8 h-8" />
              </div>
              <span className="font-bold text-muted-foreground">Add Kid</span>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
