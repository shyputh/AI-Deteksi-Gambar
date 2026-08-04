import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

env.allowLocalModels = false;

let classifier;
let isAnalysisComplete = false; 

const statusEl = document.getElementById('status');
const previewEl = document.getElementById('preview');
const uploadPromptEl = document.getElementById('upload-prompt');
const uploadEl = document.getElementById('upload-gbr');
const btnProses = document.getElementById('btn-proses');
const hasilEl = document.getElementById('hasil');
const wrapperHasilEl = document.getElementById('wrapper-hasil');

function setButtonToAnalyze() {
    isAnalysisComplete = false;
    btnProses.innerText = "Analisis Gambar";
    btnProses.className = "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-semibold py-3 px-4 rounded-xl transition shadow-md disabled:shadow-none cursor-pointer disabled:cursor-not-allowed text-center";
    btnProses.disabled = false;
}

function setButtonToUploadNew() {
    isAnalysisComplete = true;
    btnProses.innerText = "Unggah Gambar Baru";
    btnProses.className = "w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-semibold py-3 px-4 rounded-xl transition shadow-md disabled:shadow-none cursor-pointer disabled:cursor-not-allowed text-center";
    btnProses.disabled = false;
}

function tentukanKategoriBesar(label) {
    const teks = label.toLowerCase();
    
    const hewan = [
        'cat', 'dog', 'bird', 'fish', 'insect', 'animal', 'monkey', 'bear', 'tiger', 
        'lion', 'elephant', 'mouse', 'horse', 'sheep', 'cow', 'snake', 'frog', 'spider', 
        'crab', 'terrier', 'retriever', 'spaniel', 'hound', 'husky', 'collie', 'mastiff', 
        'poodle', 'beetle', 'butterfly', 'ant', 'bee', 'fox', 'wolf', 'lizard', 'turtle', 
        'whale', 'shark', 'dolphin', 'penguin', 'owl', 'eagle', 'macaw'
    ];
    
    const tumbuhan = [
        'plant', 'flower', 'tree', 'leaf', 'fruit', 'vegetable', 'grass', 'mushroom', 
        'rose', 'daisy', 'orchid', 'banana', 'apple', 'orange', 'lemon', 'corn', 
        'broccoli', 'cabbage', 'cucumber', 'strawberry', 'pineapple', 'bell pepper'
    ];
    
    const manusia = [
        'person', 'man', 'woman', 'child', 'people', 'human', 'face', 't-shirt', 'suit', 
        'jersey', 'coat', 'dress', 'cloak', 'wig', 'barber', 'player', 'diver', 'groom', 
        'bride', 'uniform', 'gown', 'apron', 'jean', 'shirt', 'sunglass', 
        'mask', 'helmet', 'hat', 'abaya', 'eye', 'nose'
    ];

    if (hewan.some(keyword => teks.includes(keyword))) return "HEWAN";
    if (tumbuhan.some(keyword => teks.includes(keyword))) return "TUMBUHAN";
    if (manusia.some(keyword => teks.includes(keyword))) return "MANUSIA";
    return "BENDA";
}

async function initAI() {
    try {
        statusEl.className = "text-center text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg py-2.5 px-4 mb-6 animate-pulse";
        statusEl.innerText = "Harap tunggu...";
        
        classifier = await pipeline('image-classification', 'Xenova/resnet-50');
        
        statusEl.className = "text-center text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg py-2.5 px-4 mb-6";
        statusEl.innerText = "Silakan unggah foto Anda (pastikan gambar jelas)";
        
    } catch (error) {
        statusEl.className = "text-center text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg py-2.5 px-4 mb-6";
        statusEl.innerText = `Gagal memuat: ${error.message || "Kesalahan jaringan"}`;
        console.error("Error Detail:", error);
    }
}

uploadEl.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const objectUrl = URL.createObjectURL(file);
        previewEl.src = objectUrl;
        
        previewEl.classList.remove('hidden');
        uploadPromptEl.classList.add('hidden');
        
        setButtonToAnalyze();
        wrapperHasilEl.classList.add('hidden');
        
        if(classifier) {
            statusEl.className = "text-center text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg py-2.5 px-4 mb-6";
            statusEl.innerText = "Klik tombol di bawah untuk menganalisis";
        }
    }
});

btnProses.addEventListener('click', async function() {
    if (isAnalysisComplete) {
        uploadEl.click(); 
        return; 
    }

    if (!classifier) {
        alert("Model AI gagal dimuat. refresh halaman.");
        return;
    }
    
    btnProses.disabled = true;
    btnProses.innerText = "Menganalisis...";
    statusEl.className = "text-center text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg py-2.5 px-4 mb-6 animate-pulse";
    statusEl.innerText = "Menganalisis objek pada gambar...";
    wrapperHasilEl.classList.add('hidden');
    
    try {
        const output = await classifier(previewEl.src);
        
        hasilEl.innerHTML = '';
        
        const tebakanTeratas = output[0];
        const kategoriUtama = tentukanKategoriBesar(tebakanTeratas.label);
        
        const infoKategori = document.createElement('div');
        infoKategori.className = "mb-4 p-3 bg-blue-950 text-blue-300 font-bold border border-blue-800 rounded-lg text-center tracking-wide text-base";
        infoKategori.innerHTML = `PREDIKSI : <span class="text-white">${kategoriUtama}</span>`;
        hasilEl.appendChild(infoKategori);

        output.forEach((item, index) => {
            const persentase = (item.score * 100).toFixed(2);
            const baris = document.createElement('div');
            baris.className = "flex justify-between items-center border-b border-slate-800 py-2 last:border-0 last:pb-0";
            
            const labelRapi = item.label.charAt(0).toUpperCase() + item.label.slice(1);
            
            baris.innerHTML = `
                <span class="text-slate-300">${index + 1}. ${labelRapi}</span>
                <span class="text-blue-400 font-semibold">${persentase}%</span>
            `;
            hasilEl.appendChild(baris);
        });

        wrapperHasilEl.classList.remove('hidden');
        statusEl.className = "text-center text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg py-2.5 px-4 mb-6";
        statusEl.innerText = "Analisis Berhasil";
        
        setButtonToUploadNew();

    } catch (error) {
        statusEl.className = "text-center text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg py-2.5 px-4 mb-6";
        statusEl.innerText = `Gagal menganalisis: ${error.message}`;
        console.error("Error Analisis:", error);
        
        setButtonToUploadNew();
    }
});

initAI();
