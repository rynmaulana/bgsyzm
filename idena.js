// ==UserScript==
// @name         Idena Flip AI Helper
// @namespace    Violentmonkey
// @version      0.1
// @description  Kirim gambar flip ke server lokal untuk prediksi AI
// @match        *://app.idena.io/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function extractFlipImages() {
    const imgs = document.querySelectorAll("img"); // Sesuaikan jika selector berbeda
    const flipImgs = Array.from(imgs).slice(0, 4); // Ambil 4 pertama

    const base64s = await Promise.all(flipImgs.map(async (img) => {
      const response = await fetch(img.src);
      const blob = await response.blob();
      return await new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    }));

    return base64s;
  }

  async function sendToAI(images) {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images }),
    });

    const result = await response.json();
    return result.order;
  }

  function showOrder(order) {
    const box = document.createElement("div");
    box.style.position = "fixed";
    box.style.top = "10px";
    box.style.right = "10px";
    box.style.zIndex = 9999;
    box.style.background = "#111";
    box.style.color = "#0f0";
    box.style.padding = "10px";
    box.style.borderRadius = "8px";
    box.innerHTML = `<b>AI Order:</b> ${order.map(i => i + 1).join(" → ")}`;
    document.body.appendChild(box);
  }

  async function runFlipAI() {
    const images = await extractFlipImages();
    const order = await sendToAI(images);
    showOrder(order);
  }

  // Tambahkan tombol untuk memicu
  const btn = document.createElement("button");
  btn.textContent = "🔍 Run AI Flip Helper";
  btn.style.position = "fixed";
  btn.style.bottom = "10px";
  btn.style.left = "10px";
  btn.style.zIndex = 9999;
  btn.style.padding = "10px";
  btn.style.borderRadius = "6px";
  btn.style.backgroundColor = "#333";
  btn.style.color = "#fff";
  btn.onclick = runFlipAI;
  document.body.appendChild(btn);
})();
