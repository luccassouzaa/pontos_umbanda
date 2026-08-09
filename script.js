import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Configuração do Firebase / Nuvem para sincronização multi-dispositivo
let db = null;
let auth = null;
let pointsCollectionRef = null;
let pendingPontoToDelete = null;

const appId = typeof __app_id !== 'undefined' ? __app_id : 'umbanda-pontos-app';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicializar persistência em nuvem se disponível no ambiente
async function initCloudSync() {
    if (!firebaseConfig) {
        console.log("Modo armazenamento local ativo.");
        return;
    }

    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }

        if (!auth.currentUser) return;

        // Path de dados públicos segundo regras do ambiente
        pointsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'pontos');

        // Atualização em tempo real via snapshot
        onSnapshot(pointsCollectionRef, (snapshot) => {
            if (!snapshot.empty) {
                const cloudPoints = [];
                snapshot.forEach((docSnap) => {
                    cloudPoints.push(docSnap.data());
                });
                if (cloudPoints.length > 0) {
                    window.pointsState = cloudPoints;
                    window.savePointsStateLocally();
                    window.renderCatalog();
                }
            } else if (window.pointsState && window.pointsState.length > 0) {
                // Se a nuvem estiver vazia, faz upload do estado inicial
                window.pointsState.forEach(ponto => {
                    setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pontos', ponto.id), ponto);
                });
            }

            const syncElem = document.getElementById('syncStatus');
            if (syncElem) syncElem.classList.remove('hidden');
        }, (err) => {
            console.warn("Sincronização em nuvem indisponível, utilizando dados locais.", err);
        });

    } catch (e) {
        console.warn("Erro ao conectar com serviço de nuvem:", e);
    }
}

// Funções globais de nuvem expostas no window
window.cloudSavePonto = async function(ponto) {
    if (!db || !auth?.currentUser) return;
    try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pontos', ponto.id), ponto);
    } catch (e) {
        console.error("Erro ao salvar no banco em nuvem:", e);
    }
};

window.cloudDeletePonto = async function(id) {
    if (!db || !auth?.currentUser) return;
    try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pontos', id));
    } catch (e) {
        console.error("Erro ao remover do banco em nuvem:", e);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    initCloudSync();
});

// Lista oficial das 21 Linhas da Curimba
const LINHAS_UMBANDA = [
    { id: 1, name: "1. Oxalá" },
    { id: 2, name: "2. Logunan" },
    { id: 3, name: "3. Oxum" },
    { id: 4, name: "4. Oxumarê" },
    { id: 5, name: "5. Oxossi" },
    { id: 6, name: "6. Obá" },
    { id: 7, name: "7. Obaluaê" },
    { id: 8, name: "8. Nanã" },
    { id: 9, name: "9. Ogum" },
    { id: 10, name: "10. Iansã" },
    { id: 11, name: "11. Omolu" },
    { id: 12, name: "12. Iemanjá" },
    { id: 13, name: "13. Xangô" },
    { id: 14, name: "14. Oroina / Egunitá" },
    { id: 15, name: "15. Preto(a) Velho(a)" },
    { id: 16, name: "16. Caboclos" },
    { id: 17, name: "17. Erês" },
    { id: 18, name: "18. Baiano" },
    { id: 19, name: "19. Boiadeiro" },
    { id: 20, name: "20. Marinheiro" },
    { id: 21, name: "21. Esquerda (Exu, Pomba Gira e Exu Mirim)" }
];

// Dados Iniciais do Acervo
const DEFAULT_POINTS = [
    // 1. Oxalá
    {
        id: "oxala_1",
        linhaId: 1,
        toque: "Ijexá",
        titulo: "",
        letra: "Eu vi meu pai Oxalá, sentado na pedra olhando pro mar (bis)\nE lá no céu, um sol fecundo brilhava\ne seu rosto reluzia\no símbolo dos anjos de deus\nA ordem de seus orixás\nE gloria da virgem de maria\nO meu pai oxalá (bis)\nEle e rei no céu, ele manda na terra, ele manda no mar\nEnviai as correntes divinas\nCom seus mensageiros, para nos ajudar",
        autor: "",
        link: ""
    },
    {
        id: "oxala_2",
        linhaId: 1,
        toque: "Ijexá",
        titulo: "",
        letra: "Divino é viver no céu, divino é viver no mar\nDivino é viver cantando no mundo, lindo, de oxalá\nOxalá meu pai, venha, nos ajudar\nVenha, nos dar as forças meu pai\nE abençoes esse conga\nDivino é poder viver, divino é poder cantar\nDivino é viver cantando no mundo, lindo, de oxalá\nOxalá meu pai, venha, nos ajudar\nVenha, nos dar as forças meu pai\nE abençoes esse conga",
        autor: "",
        link: ""
    },
    {
        id: "oxala_3",
        linhaId: 1,
        toque: "Ijexá",
        titulo: "",
        letra: "Lá no infinito uma estrela desceu, iluminando os caminhos do bem (bis)\nFoi quando o céu se abriu, clareou os campos de Belém (bis)\nAonde jesus nasceu, filho da virgem maria\nÉ ele o nosso pai, que nós chamamos de messias",
        autor: "",
        link: ""
    },
    {
        id: "oxala_4",
        linhaId: 1,
        toque: "Ijexá",
        titulo: "",
        letra: "Cruzeiro divino, cruzeiro madeiro\nAs forças divinas, de um deus verdadeiro\nDe lá vem vindo, de lá vem só\nDe lá vem vindo, a força maior",
        autor: "",
        link: ""
    },
    {
        id: "oxala_5",
        linhaId: 1,
        toque: "Ijexá",
        titulo: "Pombinho Branco",
        letra: "Pombinho branco, mensageiro de oxalá\nLeve essa mensagem, de todo coração até jesus\nDiga, que somos, soldados de aruanda\nTrabalhamos na umbanda, semeando a sua luz",
        autor: "",
        link: ""
    },
    {
        id: "oxala_6",
        linhaId: 1,
        toque: "Angola",
        titulo: "",
        letra: "Olhe pro céu, e agradeça ao senhor\nAgradeça ao senhor\nPor ter saúde, por ter paz e ter amor (bis)\nOxalá meu pai, oxalá meu pai (bis)\nNunca deixa nada, nesse mundo me faltar",
        autor: "",
        link: ""
    },

    // 2. Logunan
    {
        id: "logunan_1",
        linhaId: 2,
        toque: "Angola",
        titulo: "Coroa",
        letra: "Resplandeceu, iluminou\nLuz cristalina, minha fé cristalizou\nA Mãe Oya é a dona do tempo\nGirou seu tempo para nos guiar\nA Mãe Oyá é a dona do tempo\nGira no templo, vem nos saravá.",
        autor: "",
        link: ""
    },
    {
        id: "logunan_2",
        linhaId: 2,
        toque: "Angola",
        titulo: "Chamada",
        letra: "O tempo virou, lá no fim do horizonte\nFoi um lindo clarão, Logunan quem chegou\nEla vem com sua espada\nAcompanhada das guerreiras\nVem fazer cumprir Logunan\nAs leis de oxalá",
        autor: "",
        link: ""
    },

    // 3. Oxum
    {
        id: "oxum_1",
        linhaId: 3,
        toque: "Ijexá",
        titulo: "",
        letra: "Ê Emoriô, Ê Emoriô, Emoriô paô",
        autor: "",
        link: ""
    },
    {
        id: "oxum_2",
        linhaId: 3,
        toque: "Ijexá",
        titulo: "Cachoeiras de Oxum",
        letra: "Nas cachoeiras da mamãe oxum\nCorrem águas cristalinas, nos pés de pai Olorum\nPai Olorum, sentado as cachoeiras\nDas águas cristalinas que jesus abençoou\nEu vou pedir a permissão à oxalá\nPara banhar nas cachoeiras para todo mal levar",
        autor: "",
        link: ""
    },

    // 5. Oxossi
    {
        id: "oxossi_1",
        linhaId: 5,
        toque: "Barravento",
        titulo: "Oke Arô Caçador",
        letra: "Vamos tocar, vamos bater tambor\nEstá na hora de chamar o caçador\nOdé Odé Odé o meu pai, oke arô (bis)\n\nVem (ca)çar da aruanda, oi coroa\nOxossi é caçador\n\nOxossi deu, Oxossi dá\nOxossi deu, para quem sabe trabalhar\n\nOxossi é bom cavaleiro\nEle é faceiro até no andar\nMas quem me dera ser Oxossi\nPara correr e não poder parar",
        autor: "",
        link: ""
    },

    // 6. Obá
    {
        id: "oba_1",
        linhaId: 6,
        toque: "Barravento",
        titulo: "Mãe Obá do Conhecimento",
        letra: "Ela traz conhecimento\nVem me iluminar\nClareia meus pensamentos\nÔ minha mãe obá\n\nEla é luz da verdade\nVem me iluminar\nCom sua sabedoria\nÔ minha mãe obá\n\nIrradia o tempo todo\nE sabe ensinar\nDona do conhecimento\nÔ minha mãe obá",
        autor: "",
        link: ""
    }
];

window.pointsState = [];
let pontoToDeleteId = null;

// Inicializador da Aplicação
window.addEventListener('DOMContentLoaded', () => {
    loadPointsState();
    populateLinhasSelects();
    renderCatalog();
});

// Carregar do localStorage ou usar padrão
function loadPointsState() {
    const saved = localStorage.getItem('umbanda_pontos_db');
    if (saved) {
        try {
            window.pointsState = JSON.parse(saved);
        } catch (e) {
            window.pointsState = [...DEFAULT_POINTS];
        }
    } else {
        window.pointsState = [...DEFAULT_POINTS];
        savePointsStateLocally();
    }
}

window.savePointsStateLocally = function() {
    localStorage.setItem('umbanda_pontos_db', JSON.stringify(window.pointsState));
};

// Preencher os selects com as 21 linhas
function populateLinhasSelects() {
    const formSelect = document.getElementById('formLinha');
    formSelect.innerHTML = '<option value="">Selecione a Linha...</option>';

    LINHAS_UMBANDA.forEach(linha => {
        const opt = document.createElement('option');
        opt.value = linha.id;
        opt.textContent = linha.name;
        formSelect.appendChild(opt);
    });
}

// Renderizar todo o catálogo na tela
function renderCatalog() {
    const container = document.getElementById('pointsContainer');
    const summaryGrid = document.getElementById('summaryGrid');
    const totalBadge = document.getElementById('totalPointsBadge');

    const searchTerm = (document.getElementById('searchInput').value || '').toLowerCase();
    const toqueFilter = document.getElementById('toqueFilter').value;

    container.innerHTML = '';
    summaryGrid.innerHTML = '';

    let totalCount = 0;

    LINHAS_UMBANDA.forEach(linha => {
        // Filtrar pontos dessa linha
        const pontosDaLinha = window.pointsState.filter(p => {
            if (p.linhaId !== linha.id) return false;

            // Filtro de Toque
            if (toqueFilter && p.toque !== toqueFilter) return false;

            // Filtro de Busca
            if (searchTerm) {
                const inLetra = p.letra.toLowerCase().includes(searchTerm);
                const inTitulo = (p.titulo || '').toLowerCase().includes(searchTerm);
                const inAutor = (p.autor || '').toLowerCase().includes(searchTerm);
                const inToque = (p.toque || '').toLowerCase().includes(searchTerm);
                const inLinha = linha.name.toLowerCase().includes(searchTerm);
                return inLetra || inTitulo || inAutor || inToque || inLinha;
            }

            return true;
        });

        totalCount += pontosDaLinha.length;

        // Adicionar ao Índice / Sumário
        const summaryItem = document.createElement('div');
        summaryItem.className = `flex justify-between items-center px-2 py-1 rounded ${pontosDaLinha.length > 0 ? 'bg-amber-100/60 font-semibold text-amber-950' : 'text-slate-400 font-normal'}`;
        summaryItem.innerHTML = `
            <span class="truncate">${linha.name}</span>
            <span class="text-[10px] ml-1 px-1.5 py-0.2 bg-white/80 rounded-full border border-amber-200">${pontosDaLinha.length}</span>
        `;
        summaryGrid.appendChild(summaryItem);

        // Criar Card do Orixá/Linha na visualização de 2 colunas
        const card = document.createElement('div');
        card.className = "point-card";

        let pointsHTML = '';
        if (pontosDaLinha.length === 0) {
            if (!searchTerm && !toqueFilter) {
                pointsHTML = `<p class="text-xs text-slate-400 italic mb-4">[Espaço reservado para inclusão de pontos]</p>`;
            } else {
                return; // Oculta seções vazias na busca
            }
        } else {
            pointsHTML = pontosDaLinha.map(p => renderSinglePontoHTML(p)).join('');
        }

        card.innerHTML = `
            <h2 class="text-base sm:text-lg font-bold text-amber-900 border-b-2 border-amber-800/40 pb-1 mb-3 brand-font flex justify-between items-center">
                <span>${linha.name}</span>
                <button onclick="openAddModal(${linha.id})" class="no-print text-xs font-sans text-emerald-700 hover:text-emerald-900 font-normal hover:underline flex items-center gap-0.5">
                    + adicionar
                </button>
            </h2>
            <div class="space-y-4">
                ${pointsHTML}
            </div>
        `;

        container.appendChild(card);
    });

    totalBadge.textContent = `${totalCount} ponto${totalCount === 1 ? '' : 's'}`;

    if (totalCount === 0 && (searchTerm || toqueFilter)) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-12 text-slate-400">
                <p class="text-base font-medium">Nenhum ponto encontrado para o filtro aplicado.</p>
                <button onclick="resetFilters()" class="mt-2 text-xs text-amber-800 underline">Limpar filtros de busca</button>
            </div>
        `;
    }
}

// Gerar HTML de um único ponto
function renderSinglePontoHTML(ponto) {
    const badgeColor = getToqueBadgeColor(ponto.toque);
    const formattedLetra = escapeAndFormatLetra(ponto.letra);

    return `
        <div class="group relative bg-slate-50/50 hover:bg-slate-50 p-3 rounded-lg border border-slate-100 transition">

            <!-- Barra de Informações Superior -->
            <div class="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="inline-block text-[10px] font-bold tracking-wider ${badgeColor} px-2 py-0.5 rounded uppercase">
                        (${ponto.toque || 'Ijexá'})
                    </span>
                    ${ponto.titulo ? `<span class="text-xs font-semibold text-slate-700">· ${escapeHTML(ponto.titulo)}</span>` : ''}
                </div>

                <!-- Botões de Ação na Tela (Ocultos na Impressão) -->
                <div class="no-print opacity-0 group-hover:opacity-100 transition flex items-center gap-2 text-xs">
                    ${ponto.link ? `<a href="${escapeHTML(ponto.link)}" target="_blank" title="Ouvir no YouTube" class="text-red-600 hover:text-red-800">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>` : ''}
                    <button onclick="editPonto('${ponto.id}')" title="Editar" class="text-slate-400 hover:text-amber-800">
                        ✏️
                    </button>
                    <button onclick="deletePonto('${ponto.id}')" title="Excluir" class="text-slate-400 hover:text-red-600">
                        🗑️
                    </button>
                </div>
            </div>

            <!-- Letra do Ponto -->
            <p class="whitespace-pre-line italic text-slate-800 text-xs sm:text-sm leading-relaxed">${formattedLetra}</p>

            <!-- Autor se existir -->
            ${ponto.autor ? `<p class="mt-1.5 text-[10px] text-slate-400 font-medium tracking-wide">Autor: ${escapeHTML(ponto.autor)}</p>` : ''}
        </div>
    `;
}

// Formatação de cores dos toques
function getToqueBadgeColor(toque) {
    switch ((toque || '').toLowerCase()) {
        case 'ijexá': return 'bg-amber-100 text-amber-900 border border-amber-200';
        case 'nagô': return 'bg-emerald-100 text-emerald-900 border border-emerald-200';
        case 'barravento': return 'bg-red-100 text-red-900 border border-red-200';
        case 'angola': return 'bg-blue-100 text-blue-900 border border-blue-200';
        case 'congo de ouro': return 'bg-purple-100 text-purple-900 border border-purple-200';
        case 'cabula': return 'bg-orange-100 text-orange-900 border border-orange-200';
        default: return 'bg-slate-200 text-slate-800';
    }
}

// Abrir Modal de Adicionar
function openAddModal(preSelectedLinhaId = null) {
    document.getElementById('modalTitle').textContent = "Adicionar Novo Ponto Cantado";
    document.getElementById('pontoForm').reset();
    document.getElementById('editingId').value = "";

    if (preSelectedLinhaId) {
        document.getElementById('formLinha').value = preSelectedLinhaId;
    }

    document.getElementById('pontoModal').classList.remove('hidden');
}

// Fechar Modal
function closeAddModal() {
    document.getElementById('pontoModal').classList.add('hidden');
}

// Submeter formulário (Criar ou Editar)
function handleFormSubmit(event) {
    event.preventDefault();

    const editingId = document.getElementById('editingId').value;
    const linhaId = parseInt(document.getElementById('formLinha').value, 10);
    const toque = document.getElementById('formToque').value;
    const titulo = document.getElementById('formTitulo').value.trim();
    const letra = document.getElementById('formLetra').value.trim();
    const autor = document.getElementById('formAutor').value.trim();
    const link = document.getElementById('formLink').value.trim();

    if (!linhaId || !toque || !letra) {
        showToast("Por favor, preencha todos os campos obrigatórios (*)", "error");
        return;
    }

    let pontoToSave = null;

    if (editingId) {
        // Atualizar existente
        const index = window.pointsState.findIndex(p => p.id === editingId);
        if (index !== -1) {
            pontoToSave = {
                ...window.pointsState[index],
                linhaId,
                toque,
                titulo,
                letra,
                autor,
                link
            };
            window.pointsState[index] = pontoToSave;
        }
    } else {
        // Criar novo
        pontoToSave = {
            id: "ponto_" + Date.now(),
            linhaId,
            toque,
            titulo,
            letra,
            autor,
            link
        };
        window.pointsState.push(pontoToSave);
    }

    savePointsStateLocally();
    if (window.cloudSavePonto && pontoToSave) {
        window.cloudSavePonto(pontoToSave);
    }

    renderCatalog();
    closeAddModal();
    showToast("Ponto salvo com sucesso!", "success");
}

// Editar Ponto Existente
function editPonto(id) {
    const ponto = window.pointsState.find(p => p.id === id);
    if (!ponto) return;

    document.getElementById('modalTitle').textContent = "Editar Ponto Cantado";
    document.getElementById('editingId').value = ponto.id;
    document.getElementById('formLinha').value = ponto.linhaId;
    document.getElementById('formToque').value = ponto.toque || 'Ijexá';
    document.getElementById('formTitulo').value = ponto.titulo || '';
    document.getElementById('formLetra').value = ponto.letra || '';
    document.getElementById('formAutor').value = ponto.autor || '';
    document.getElementById('formLink').value = ponto.link || '';

    document.getElementById('pontoModal').classList.remove('hidden');
}

// Excluir Ponto (Via Modal de Confirmação Customizado)
function deletePonto(id) {
    pontoToDeleteId = id;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
    pontoToDeleteId = null;
    document.getElementById('deleteModal').classList.add('hidden');
}

function executeDeletePonto() {
    if (!pontoToDeleteId) return;

    const id = pontoToDeleteId;
    window.pointsState = window.pointsState.filter(p => p.id !== id);
    savePointsStateLocally();

    if (window.cloudDeletePonto) {
        window.cloudDeletePonto(id);
    }

    renderCatalog();
    closeDeleteModal();
    showToast("Ponto removido com sucesso.", "info");
}

// EXPORTAÇÃO E BACKUP PARA GITHUB
function openExportModal() {
    document.getElementById('exportModal').classList.remove('hidden');
}

function closeExportModal() {
    document.getElementById('exportModal').classList.add('hidden');
}

function downloadJSONBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.pointsState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "pontos_umbanda.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Backup baixado com sucesso!", "success");
}

function copyPointsToClipboard() {
    const jsonText = JSON.stringify(window.pointsState, null, 2);
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = jsonText;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    showToast("Dados dos pontos copiados para a área de transferência!", "success");
}

function importJSONBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                window.pointsState = importedData;
                savePointsStateLocally();

                // Sincronizar importação com a nuvem se disponível
                if (window.cloudSavePonto) {
                    importedData.forEach(ponto => window.cloudSavePonto(ponto));
                }

                renderCatalog();
                closeExportModal();
                showToast("Dados importados com sucesso!", "success");
            } else {
                showToast("O arquivo JSON deve conter uma lista válida de pontos.", "error");
            }
        } catch (err) {
            showToast("Erro ao ler arquivo JSON de backup.", "error");
        }
    };
    reader.readAsText(file);
}

// Filtros e Utilidades
function filterPoints() {
    renderCatalog();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('toqueFilter').value = '';
    renderCatalog();
}

// Auxiliares de Sanitização de Texto
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

function escapeAndFormatLetra(str) {
    if (!str) return '';
    const escaped = escapeHTML(str);
    return escaped.replace(/\(bis\)/gi, '<strong class="text-amber-900 font-semibold">(bis)</strong>');
}

// Toast de notificação UI (Substituto de alert)
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-800 text-white' : type === 'error' ? 'bg-red-800 text-white' : 'bg-slate-800 text-white';

    toast.className = `px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl transform transition-all duration-300 opacity-0 translate-y-2 flex items-center gap-2 ${bgClass}`;
    toast.innerHTML = `<span>${escapeHTML(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-2');
    }, 10);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
window.handleFormSubmit = handleFormSubmit;
window.editPonto = editPonto;
window.deletePonto = deletePonto;
window.closeDeleteModal = closeDeleteModal;
window.executeDeletePonto = executeDeletePonto;
window.openExportModal = openExportModal;
window.closeExportModal = closeExportModal;
window.downloadJSONBackup = downloadJSONBackup;
window.copyPointsToClipboard = copyPointsToClipboard;
window.importJSONBackup = importJSONBackup;
window.filterPoints = filterPoints;
window.resetFilters = resetFilters;
window.showToast = showToast;
window.renderCatalog = renderCatalog;
