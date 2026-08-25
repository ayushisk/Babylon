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
      scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.1, 1);

      // --- Environment (skybox + IBL lighting) ---
      const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
        "/environment/room1.env",
        scene
      );



      scene.environmentTexture = envTexture;
      scene.createDefaultSkybox(envTexture, true, 1000, 0);
      scene.environmentIntensity = 1.0;

      // --- Camera ---
      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 1.5,
        Math.PI / 2.5,
        20,
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      camera.speed = 0.25;
      camera.attachControl(canvasRef.current, true);
      camera.lowerRadiusLimit = 5;
      camera.upperRadiusLimit = 40;
      camera.upperBetaLimit = Math.PI / 2.1;

      // --- Lights ---
      const ambientLight = new BABYLON.HemisphericLight(
        "ambient",
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      ambientLight.intensity = 1;

      const light1 = new BABYLON.PointLight(
        "light1",
        new BABYLON.Vector3(0, 10, 0),
        scene
      );
      light1.intensity = 0.8;

      // --- Car ---
      const carMaterial = new BABYLON.StandardMaterial("carMat", scene);
      carMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
      materialRef.current = carMaterial;

      BABYLON.SceneLoader.ImportMesh(
        "",
        "/models/",
        "Vintage Car.glb",
        scene,
        function (meshes) {
          const root = new BABYLON.TransformNode("root", scene);
          meshes.forEach((m) => {
            if (m.parent === null) m.setParent(root);
            if (m.getClassName() === "Mesh") {
              m.material = carMaterial;
            }
          });

          root.rotation.x = -Math.PI / 2;
          root.position.y = 0.05;

          const {min, max} = root.getHierarchyBoundingVectors(true);
          const center = min.add(max).scale(0.5);
          const height = max.y - min.y;

          camera.setTarget(
            new BABYLON.Vector3(center.x, center.y + height * 0.4, center.z)
          );

          // SETUP CAMERA ZOOM
          camera.useFramingBehavior = true;
          const framingBehavior = camera.getBehaviorByName("Framing");
          framingBehavior.radiusScale = 1.6;
          framingBehavior.framingTime = 0;
          framingBehavior.zoomOnMeshesHierarchy(meshes);

          camera.setTarget(
            new BABYLON.Vector3(center.x, center.y + height * 0.4, center.z)
          )
        }
      );

      return scene;
    };

    const scene = createScene();
    engine.runRenderLoop(() => scene.render());

    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      engine.dispose();
    };
  }, []);

  const changeColor = (hex) => {
    if (materialRef.current) {
      materialRef.current.diffuseColor = BABYLON.Color3.FromHexString(hex);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <canvas
        ref={canvasRef}
        id="renderCanvas"
        style={{ width: "100%", height: "100%", touchAction: "none" }}
      />

      <div style={styles.controls}>
        <button style={styles.btn} onClick={() => changeColor("#ff0000")}>Red</button>
        <button style={styles.btn} onClick={() => changeColor("#00ff00")}>Green</button>
        <button style={styles.btn} onClick={() => changeColor("#0000ff")}>Blue</button>
        <button style={styles.btn} onClick={() => changeColor("#222222")}>Matte Black</button>
      </div>
    </div>
  );
}

const styles = {
  controls: {
    position: "absolute",
    bottom: 40,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "15px",
    zIndex: 10,
    background: "rgba(0, 0, 0, 0.7)",
    padding: "15px 25px",
    borderRadius: "50px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  btn: {
    padding: "10px 20px",
    cursor: "pointer",
    background: "#fff",
    border: "none",
    borderRadius: "25px",
    fontWeight: "bold",
    fontSize: "14px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  },
};