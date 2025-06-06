import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MicrophoneIcon } from "@heroicons/react/24/outline";

const VoiceInput = ({ onVoiceInput, isRecording, status }) => {
  return (
    <motion.button
      onClick={onVoiceInput}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="relative group"
    >
      <div className={`relative p-2 rounded-full transition-all duration-300 ${
        isRecording 
          ? 'bg-red-500/20 backdrop-blur-sm' 
          : 'bg-white/20 backdrop-blur-sm'
      } shadow-lg hover:shadow-xl`}>
        <div className="relative z-10">
          <MicrophoneIcon className={`h-5 w-5 ${isRecording ? 'text-red-500' : 'text-white'}`} />
        </div>
      </div>
      
      {/* Status indicator */}
      {isRecording && (
        <motion.div
          className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

export default VoiceInput; 