(() => {
    'use strict';

    /* ==========================================================================
       CONFIGURAÇÃO - edite apenas este bloco
       ========================================================================== */
    const CONFIG = {
        // Formato internacional, só dígitos. Ex.: "5521999999999". Vazio = botão oculto
        // e formulário apenas exibe confirmação local (nada é enviado).
        whatsapp: '',
        whatsappGreeting: 'Olá! Gostaria de falar com a Igreja do Evangelho Quadrangular de Padre Miguel.'
    };

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

    /* ---------- Ano no rodapé ---------- */
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    /* ---------- Menu mobile ---------- */
    const header = $('.header');
    const toggle = $('.menu-toggle');
    const menu = $('#menu');

    const setMenu = (open) => {
        if (!toggle || !menu) return;
        menu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        toggle.firstElementChild.textContent = open ? '✕' : '☰';
    };

    if (toggle && menu) {
        toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
        menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('is-open')) {
                setMenu(false);
                toggle.focus();
            }
        });
        document.addEventListener('click', (e) => {
            if (menu.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
        });
        window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
            if (e.matches) setMenu(false);
        });
    }

    /* ---------- Sombra do header ao rolar ---------- */
    if (header) {
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                header.classList.toggle('is-scrolled', window.scrollY > 8);
                ticking = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ---------- Link ativo no menu (scroll-spy) ---------- */
    const links = $$('.menu a[href^="#"]');
    const sections = links
        .map((a) => $(a.getAttribute('href')))
        .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                links.forEach((a) => {
                    const active = a.getAttribute('href') === `#${entry.target.id}`;
                    a.classList.toggle('is-active', active);
                    if (active) a.setAttribute('aria-current', 'true');
                    else a.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach((s) => spy.observe(s));
    }

    /* ---------- WhatsApp flutuante ---------- */
    const whatsapp = $('#whatsapp');
    const waNumber = CONFIG.whatsapp.replace(/\D/g, '');

    if (whatsapp) {
        if (waNumber) {
            whatsapp.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(CONFIG.whatsappGreeting)}`;
            whatsapp.hidden = false;
        } else {
            whatsapp.remove();
        }
    }

    /* ---------- Redes sociais: só exibe card se houver link ---------- */
    $$('[data-social]').forEach((card) => {
        const href = (card.dataset.href || '').trim();
        const link = $('a', card);
        if (href && link) {
            link.href = href;
        } else {
            card.hidden = true;
        }
    });

    /* ---------- Formulário de oração ---------- */
    const form = $('#prayerForm');
    const message = $('#formMessage');

    if (form && message) {
        const showMessage = (text, type) => {
            message.textContent = text;
            message.className = `form-message is-${type}`;
        };

        const clean = (value) => value.replace(/\s+/g, ' ').trim();

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameField = form.elements.nome;
            const requestField = form.elements.pedido;
            const name = clean(nameField.value);
            const request = requestField.value.trim();

            nameField.classList.toggle('is-invalid', !name);
            requestField.classList.toggle('is-invalid', !request);

            if (!name || !request) {
                showMessage('Preencha seu nome e o pedido de oração.', 'error');
                (!name ? nameField : requestField).focus();
                return;
            }

            if (waNumber) {
                const text = `Pedido de oração\nNome: ${name}\n\n${request}`;
                window.open(
                    `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`,
                    '_blank',
                    'noopener'
                );
                showMessage('Abrimos o WhatsApp para você concluir o envio.', 'success');
            } else {
                // Sem destino configurado: não finge que enviou.
                showMessage('Formulário em modo de demonstração: nenhum envio foi realizado.', 'error');
                return;
            }

            form.reset();
        });

        form.addEventListener('input', (e) => e.target.classList.remove('is-invalid'));
    }
})();
