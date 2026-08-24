"use client";

import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

const BIKE_COLORS = [
  { id: "supernova", name: "Supernova Black", hex: "#1a1a1a", metal: 0.8, rough: 0.2 },
  { id: "fireball", name: "Fireball Red", hex: "#8B0000", metal: 0.6, rough: 0.1 },
  { id: "stellar", name: "Stellar Blue", hex: "#003366", metal: 0.7, rough: 0.2 },
];

export default function Configurator() {
  const canvasRef = useRef(null);
  const [scene, setScene] = useState(null);
  const [selectedColor, setSelectedColor] = useState(BIKE_COLORS[0]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const newScene = new BABYLON.Scene(engine);
    newScene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.05, 1);

    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 1.5,
      Math.PI / 2.2,
      6,
      new BABYLON.Vector3(0, 1, 0),
      newScene
    );
    camera.attachControl(canvasRef.current, true);
    
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), newScene);
    light.intensity = 0.7;

    const spotLight = new BABYLON.SpotLight("spot", new BABYLON.Vector3(0, 10, 5), new BABYLON.Vector3(0, -1, -1), Math.PI / 3, 2, newScene);
    spotLight.intensity = 1.5;

    newScene.createDefaultEnvironment({
      createGround: true,
      groundSize: 20,
      groundColor: new BABYLON.Color3(0.1, 0.1, 0.1),
      enableGroundMirror: true, 
      groundMirrorAmount: 0.3,
    });

    // Note: STL files often import as a single mesh. 
    // If "Tank" or "Body" naming doesn't exist in the STL, the color won't apply.
    BABYLON.SceneLoader.ImportMesh("", "/models/", "Vintage Car.stl", newScene, (meshes) => {
      meshes.forEach(m => m.position.y = 0);
      applyColor(newScene, BIKE_COLORS[0]);
    });

    setScene(newScene);
    engine.runRenderLoop(() => {
      newScene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      engine.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const applyColor = (targetScene, colorConfig) => {
    if (!targetScene) return;
    
    // Since STL files usually don't have named parts, 
    // you might need to apply the material to ALL meshes if name-check fails.
    targetScene.meshes.forEach((mesh) => {
      // Check if it's the model and not the ground/environment
      if (mesh.name !== "BackgroundPlane" && mesh.name !== "BackgroundSkybox" && mesh.name !== "ground") {
        const material = new BABYLON.PBRMaterial("bikeMat", targetScene);
        material.albedoColor = BABYLON.Color3.FromHexString(colorConfig.hex);
        material.metallic = colorConfig.metal;
        material.roughness = colorConfig.rough;
        mesh.material = material;
      }
    });
    setSelectedColor(colorConfig);
  };

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden font-sans">
      {/* 1. 3D RENDER CANVAS - Added absolute and z-0 */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full outline-none z-0" 
      />


      {/* 3. RIGHT SIDE SELECTOR - Added z-10 and pointer-events-auto */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-8 bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl z-10 pointer-events-auto">
        <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] [writing-mode:vertical-lr] rotate-180">
          Customise
        </p>
        
        <div className="flex flex-col gap-4">
          {BIKE_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => applyColor(scene, color)}
              className={`w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 flex items-center justify-center ${
                selectedColor.id === color.id ? "border-yellow-500" : "border-transparent"
              }`}
            >
              <div 
                className="w-8 h-8 rounded-full shadow-inner" 
                style={{ backgroundColor: color.hex }}
              />
            </button>
          ))}
        </div>
        
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </div>

  
     
    </div>
  );
}