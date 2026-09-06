// js/app.js
// Navegação, helpers e funções globais

// ============================================================
//  NAVEGAÇÃO
// ============================================================

function showSection(section, element) {
    // Esconder todas as seções
    document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));

    // Mostrar a seção selecionada
    const target = document.getElementById(`section-${section}`);
    if (target) target.classList.add('active');

    // Atualizar navegação
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    } else {
        // Fallback: encontrar pelo texto
        document.querySelectorAll('.nav-item').forEach(n => {
            const span = n.querySelector('span');
            if (span && span.textContent.toLowerCase() === section) {
                n.classList.add('active');
            }
        });
    }
}

// ============================================================
//  HELPERS DE FORMULÁRIO
// ============================================================

function mark(inputId, errId) {
    const el = document.getElementById(inputId);
    if (el) el.classList.add('error');
    const errEl = document.getElementById(errId);
    if (errEl) errEl.classList.add('visible');
}

function markSel(selId, errId) {
    const errEl = document.getElementById(errId);
    if (errEl) errEl.classList.add('visible');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('visible');
}

// ============================================================
//  MÁSCARAS
// ============================================================

function maskCPF(el) {
    let v = el.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 9) v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2}).*/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/^(\d{3})(\d{1,3}).*/, '$1.$2');
    el.value = v;
}

function maskTel(el) {
    let v = el.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    el.value = v;
}

// ============================================================
//  FECHAR MODAIS CLICANDO FORA
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.modal-overlay').forEach(m => {
        m.addEventListener('click', e => {
            if (e.target === m) m.classList.remove('visible');
        });
    });

    // Enter key para login
    document.addEventListener('keydown', e => {
        if (e.key === 'Enter' && document.getElementById('page-login').classList.contains('active')) {
            doLogin();
        }
    });
});