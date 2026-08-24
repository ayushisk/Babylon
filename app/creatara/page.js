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

     
      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2, 
        Math.PI / 2.5, 
        10, 
        BABYLON.Vector3.Zero(),
        scene
      );
      
      camera.attachControl(canvasRef.current, true);
      
   
      camera.lowerBetaLimit = 0.1;
      camera.upperBetaLimit = Math.PI / 2.1;


      camera.wheelDeltaPercentage = 0.01;
      camera.panningSensibility = 0; // Set to 0 if you only want rotation, >0 to allow right-click drag

   
      new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    
      const material = new BABYLON.StandardMaterial("carMat", scene);
      material.diffuseColor = new BABYLON.Color3(1, 0, 0); 
      materialRef.current = material;

     
      BABYLON.SceneLoader.ImportMesh(
        "",
        "/models/",
        "Vintage Car.glb",
        // "Vintage Car.stl",
        scene,
        function (meshes) {
         
          const root = new BABYLON.TransformNode("root", scene);
          meshes.forEach((m) => {
            if (m.parent === null) {
              m.setParent(root);
            }
          });


        
          meshes.forEach((mesh) => {
            if (mesh.getClassName() === "Mesh") {
              mesh.material = material;
            }
          });

          root.rotation.x = - Math.PI /2;


          camera.useFramingBehavior = true;
          const framingBehavior = camera.getBehaviorByName("Framing");
          framingBehavior.framingTime = 0; 
          framingBehavior.elevationReturnTime = -1; 
     
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