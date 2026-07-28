import { pipeline } from 'https://jsdelivr.net';

let classifier;
const statusEl = document.getElementById('status');
const previewEl = document.getElementById('preview');
const uploadPromptEl = document.getElementById('upload-prompt');
const uploadEl = document.getElementById('upload-gbr');
const btnProses = document.getElementById('btn-proses');
const hasilEl = document.getElementById('hasil');
const wrapperHasilEl = document.getElementById('wrapper-hasil');

async function initAI() {
    try {
        statusEl.className = "text-center text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg py-2.5 px-4 mb-6 animate-pulse";
        statusEl.innerText = "Memuat model AI (Sangat ringan, ±13 MB)...";
        
        classifier = await pipeline('image-classification', 'Xenova/mobilenetv2_1.0_224');
        
        statusEl.className = "text-center text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg py-2.5 px-4 mb-6";
        statusEl.innerText = "Sistem Siap! Silakan unggah foto Anda.";
    } catch (error) {
        statusEl.className = "text-center text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg py-2.5 px-4 mb-6";
        statusEl.innerText = "Gagal memuat model. Coba segarkan (refresh) halaman.";
        console.error(error);
    }
}

uploadEl.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            previewEl.src = event.target.result;
            previewEl.classList.remove('hidden');
            uploadPromptEl.classList.add('hidden');
            btnProses.disabled = false;
            wrapperHasilEl.classList.add('hidden');
            statusEl.innerText = "Gambar berhasil dimuat. Klik tombol di bawah untuk menganalisis.";
        };
        reader.readAsDataURL(file);
    }
});

btnProses.addEventListener('click', async function() {
    if (!classifier) return;
    
    btnProses.disabled = true;
    statusEl.innerText = "Menganalisis objek pada gambar...";
    wrapperHasilEl.classList.add('hidden');
    
    try {
        const output = await classifier(previewEl.src);
        
        hasilEl.innerHTML = '';
        output.forEach((item, index) => {
            const persentase = (item.score * 100).toFixed(2);
            const baris = document.createElement('div');
            baris.className = "flex justify-between items-center border-b border-slate-800 pb-2 last:border-0 last:pb-0";
            baris.innerHTML = `
                <span class="text-slate-300 font-bold">${index + 1}. ${item.label}</span>
                <span class="text-indigo-400 font-semibold">${persentase}% Akurat</span>
            `;
            hasilEl.appendChild(baris);
        });

        wrapperHasilEl.classList.remove('hidden');
        statusEl.innerText = "Analisis Berhasil!";
    } catch (error) {
        statusEl.innerText = "Terjadi kesalahan saat memproses gambar.";
        console.error(error);
    } {
        btnProses.disabled = false;
    }
});

initAI();
