"use client";

import React, { useEffect, useRef } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

export default function Page() {
  const canvasRef = useRef(null);
  const materialRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    engineRef.current = engine;

    const createScene = function () {
      const scene = new BABYLON.Scene(engine);

      // 1. Camera Setup
      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2, // Alpha: Horizontal rotationdfdf
        Math.PI / 2.5, 
        10, // Radius: Initial distance
        BABYLON.Vector3.Zero(),
        scene
      );
      
      camera.attachControl(canvasRef.current, true);
      
      // Limits to prevent looking under the floor
      camera.lowerBetaLimit = 0.1;
      camera.upperBetaLimit = Math.PI / 2.1;

      // Smooth interaction settings
      camera.wheelDeltaPercentage = 0.01;
      camera.panningSensibility = 0; // Set to 0 if you only want rotation, >0 to allow right-click drag

      // 2. Lighting
      new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

      // 3. Material
      const material = new BABYLON.StandardMaterial("carMat", scene);
      material.diffuseColor = new BABYLON.Color3(1, 0, 0); 
      materialRef.current = material;

      // 4. Model Loading with Centering Logic
      BABYLON.SceneLoader.ImportMesh(
        "",
        "/models/",
        "Vintage Car.glb",
        // "Vintage Car.stl",
        scene,
        function (meshes) {
          // GLB files have a __root__ node at index 0
          const root = meshes[0];


          // Apply material only to actual meshes
          meshes.forEach((mesh) => {
            if (mesh.getClassName() === "Mesh") {
              mesh.material = material;
            }
          });

          root.rotation.x = Math.PI /2;


          // FIX ROTATION: Use FramingBehavior to center the camera on the car geometry
          // This prevents the "wobble" if the model's pivot point is off-center
          camera.useFramingBehavior = true;
          const framingBehavior = camera.getBehaviorByName("Framing");
          framingBehavior.framingTime = 0; // Instant snap on load
          framingBehavior.elevationReturnTime = -1; // Prevent camera from auto-moving back
          
          // Focus the camera on the car's bounding box
          camera.framingBehavior.zoomOnMeshesHierarchy(meshes);
        }
      );

      return scene;
    };

    const scene = createScene();

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      engine.dispose();
    };
  }, []);

  const changeColor = (hex) => {
    if (!materialRef.current) return;
    materialRef.current.diffuseColor = BABYLON.Color3.FromHexString(hex);
  };

  return (
    <>
      <canvas ref={canvasRef} id="renderCanvas" />

      <div style={styles.controls}>
        <button style={styles.btn} onClick={() => changeColor("#ff0000")}>Red</button>
        <button style={styles.btn} onClick={() => changeColor("#00ff00")}>Green</button>
        <button style={styles.btn} onClick={() => changeColor("#0000ff")}>Blue</button>
        <button style={styles.btn} onClick={() => changeColor("#000000")}>Black</button>
      </div>
    </>
  );
}

const styles = {
  controls: {
    position: "absolute",
    top: 20,
    left: 20,
    display: "flex",
    gap: "10px",
    zIndex: 10,
  },
  btn: {
    padding: "8px 16px",
    cursor: "pointer",
    background: "rgba(255, 255, 255, 0.8)",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontWeight: "bold"
  }
};