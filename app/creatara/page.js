"use client";

import React, { useEffect } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

//
export default function Page() {
  useEffect(() => {
    const canvas = document.getElementById("renderCanvas");

    const engine = new BABYLON.Engine(canvas, true);

    const createScene = function () {
      const scene = new BABYLON.Scene(engine);

      scene.createDefaultCameraOrLight(true, false, true);

      BABYLON.SceneLoader.Append(
        "/models/",
        "Vintage Car.stl",
        scene
      );

      BABYLON.SceneLoader.Append("/models/", "Vintage Car.stl", scene);

      return scene;
    };

    const scene = createScene();

    engine.runRenderLoop(function () {
      scene.render();
    });

    window.addEventListener("resize", () => {
      engine.resize();
    });

    return () => {
      engine.dispose();
    };
  }, []);

  return <canvas id="renderCanvas" />;
}
