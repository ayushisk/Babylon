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
      scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.1, 1); // Dark background


      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 1.5,
        Math.PI / 2.5,
        20,
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      camera.attachControl(canvasRef.current, true);
      

      camera.lowerRadiusLimit = 5;
      camera.upperRadiusLimit = 40;
      camera.upperBetaLimit = Math.PI / 2.1;


      const ambientLight = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0, 1, 0), scene);
      ambientLight.intensity = 0.4;

 
      const light1 = new BABYLON.PointLight("light1", new BABYLON.Vector3(0, 10, 0), scene);
      light1.intensity = 0.8;

   
      
  
      const floor = BABYLON.MeshBuilder.CreateGround("floor", { width: 60, height: 60 }, scene);
      const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
      floorMat.diffuseTexture = new BABYLON.Texture("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIR_2ij67HwDyHVomQfj0vemKPbaJYcufl45jdv-Zo2Rdv6LsErRn44gZ8&s=10", scene);
      // floorMat.diffuseTexture.uScale = 10;
      // floorMat.diffuseTexture.vScale = 10;
      floorMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      floor.material = floorMat;

   
      const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
      wallMat.diffuseTexture = new BABYLON.Texture("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfMoVF3IQvhd-KgjGzxsphBjcCZFTUFsyZDEntsniaJSB6eb848ihhZNj8&s=10", scene);
      // wallMat.diffuseTexture.uScale = 4;
      // wallMat.diffuseTexture.vScale = 2;

      const leftWallMat = new BABYLON.StandardMaterial("leftWallMat", scene);
leftWallMat.diffuseTexture = new BABYLON.Texture("https://h2osupplies.com.au/cdn/shop/articles/Why_Is_My_Garage_Wall_Leaking_After_Rain_H2O_Blog_6cfb4b8c-9679-4e11-ac07-3527f2505cd2.jpg?v=1772520028", scene);

    
      const backWall = BABYLON.MeshBuilder.CreatePlane("backWall", { width: 60, height: 20 }, scene);
      backWall.position.z = 30;
      backWall.position.y = 10;
      backWall.rotation.y = Math.PI; // Flip to face inward
      backWall.material = wallMat;


      const leftWall = BABYLON.MeshBuilder.CreatePlane("leftWall", { width: 60, height: 20 }, scene);
      leftWall.position.x = -30;
      leftWall.position.y = 10;
      leftWall.rotation.y = -Math.PI / 2; 
     leftWall.material = leftWallMat;

    
      const rightWall = BABYLON.MeshBuilder.CreatePlane("rightWall", { width: 60, height: 20 }, scene);
      rightWall.position.x = 30;
      rightWall.position.y = 10;
      rightWall.rotation.y = Math.PI / 2; 
      rightWall.material = wallMat;


      const poster1 = BABYLON.MeshBuilder.CreatePlane("poster1", { width: 6, height: 8 }, scene);
      poster1.position.set(-29.9, 7, 5); 
      poster1.rotation.y = -Math.PI / 2;
      const posterMat1 = new BABYLON.StandardMaterial("posterMat1", scene);
      posterMat1.diffuseTexture = new BABYLON.Texture("https://playground.babylonjs.com/textures/impact.png", scene);
      poster1.material = posterMat1;

     
      const poster2 = BABYLON.MeshBuilder.CreatePlane("poster2", { width: 8, height: 4 }, scene);
      poster2.position.set(0, 12, 29.9); 
      const posterMat2 = new BABYLON.StandardMaterial("posterMat2", scene);
      posterMat2.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2); // Red vintage sign look
      poster2.material = posterMat2;


      const workbench = BABYLON.MeshBuilder.CreateBox("workbench", { width: 8, height: 3, depth: 3 }, scene);
      workbench.position.set(-26, 1.5, 20);
      const benchMat = new BABYLON.StandardMaterial("benchMat", scene);
      benchMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      workbench.material = benchMat;

 
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

          // SETUP CAMERA ZOOM
          camera.useFramingBehavior = true;
          const framingBehavior = camera.getBehaviorByName("Framing");
          framingBehavior.radiusScale = 3.0; // Higher = zoom further out to see garage
          framingBehavior.zoomOnMeshesHierarchy(meshes);
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
      <canvas ref={canvasRef} id="renderCanvas" style={{ width: '100%', height: '100%', touchAction: 'none' }} />

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
    border: "1px solid rgba(255,255,255,0.2)"
  },
  btn: {
    padding: "10px 20px",
    cursor: "pointer",
    background: "#fff",
    border: "none",
    borderRadius: "25px",
    fontWeight: "bold",
    fontSize: "14px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
  }
};