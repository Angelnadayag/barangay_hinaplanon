// Progressive presentation enhancements only. Existing routes, payloads and page handlers remain in control.
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('i.fa, i.fas, i.far').forEach(icon => icon.setAttribute('aria-hidden', 'true'));
    const body = document.body;
    const sidebar = document.getElementById('app-sidebar');
    const toggle = document.getElementById('sidebar-toggle');
    const backdrop = document.getElementById('sidebar-backdrop');
    const mobile = window.matchMedia('(max-width: 1023px)');
    const focusable = root => [...root.querySelectorAll('a[href], button:not(:disabled), input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]')]
        .filter(el => el.getClientRects().length && !el.closest('[inert]'));
    if (sidebar && toggle) {
        let collapsed = false;
        try { collapsed = localStorage.getItem('padayon.sidebar.collapsed') === '1'; } catch (_) { /* storage may be disabled */ }
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'btn btn-outline sidebar-mobile-close';
        close.textContent = 'Close navigation';
        sidebar.querySelector('.sidebar-brand').after(close);
        function update(open = false) {
            body.classList.toggle('sidebar-collapsed', !mobile.matches && collapsed);
            body.classList.toggle('nav-open', mobile.matches && open);
            sidebar.inert = mobile.matches && !open;
            sidebar.setAttribute('aria-hidden', String(mobile.matches && !open));
            toggle.setAttribute('aria-expanded', String(mobile.matches ? open : !collapsed));
            toggle.setAttribute('aria-label', mobile.matches ? (open ? 'Close navigation' : 'Open navigation') : (collapsed ? 'Expand navigation' : 'Collapse navigation'));
            document.querySelector('.main-content-wrapper').inert = mobile.matches && open;
            body.style.overflow = mobile.matches && open ? 'hidden' : '';
            sidebar.removeAttribute('role');
            sidebar.removeAttribute('aria-modal');
            if (mobile.matches && open) {
                sidebar.setAttribute('role', 'dialog');
                sidebar.setAttribute('aria-modal', 'true');
            }
            window.dispatchEvent(new Event('padayon:layout'));
        }
        function closeDrawer() { update(false); toggle.focus(); }
        toggle.hidden = false;
        update();
        toggle.addEventListener('click', () => {
            if (mobile.matches) {
                update(!body.classList.contains('nav-open'));
                if (body.classList.contains('nav-open')) close.focus();
            } else {
                collapsed = !collapsed;
                try { localStorage.setItem('padayon.sidebar.collapsed', collapsed ? '1' : '0'); } catch (_) { /* optional preference */ }
                update();
            }
        });
        close.addEventListener('click', closeDrawer);
        backdrop.addEventListener('click', closeDrawer);
        sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { if (mobile.matches) update(false); }));
        mobile.addEventListener('change', () => update());
        document.addEventListener('keydown', event => {
            if (!body.classList.contains('nav-open')) return;
            if (event.key === 'Escape') { event.preventDefault(); closeDrawer(); }
            if (event.key === 'Tab') {
                const items = focusable(sidebar);
                const first = items[0], last = items[items.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        });
    }

    const account = document.getElementById('account-menu');
    if (account) {
        document.addEventListener('click', event => { if (!account.contains(event.target)) account.open = false; });
        account.addEventListener('keydown', event => {
            if (event.key === 'Escape') { account.open = false; account.querySelector('summary').focus(); }
        });
    }

    // Connect existing labels and instructions, including legacy inline forms.
    const fieldLabels = { purok_id: 'Purok / zone', priority: 'Priority filter', claiming_date: 'Claiming date',
        assistance_status: 'Assistance status', risk_classification: 'Risk classification', notes: 'Notes',
        replenish_quantity: 'Quantity to add', status: 'Status filter' };
    document.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach((field, index) => {
        if (!field.id) field.id = 'ui-field-' + index;
        let label = field.labels && field.labels[0];
        const group = field.closest('.form-group');
        if (!label) {
            const candidate = (group || field.parentElement).querySelector('label');
            if (candidate && (!candidate.htmlFor || candidate.htmlFor === field.id)) {
                candidate.htmlFor = field.id;
                label = candidate;
            }
        }
        if (!label && !field.hasAttribute('aria-label') && !field.hasAttribute('aria-labelledby')) {
            field.setAttribute('aria-label', fieldLabels[field.name] || field.placeholder || field.name.replaceAll('_', ' ') || 'Filter records');
        }
        if (field.required && label && !label.textContent.includes('*')) {
            const required = document.createElement('span');
            required.textContent = ' *';
            required.setAttribute('aria-hidden', 'true');
            label.append(required);
        }
        if (group) {
            const hint = group.querySelector('small');
            if (hint) {
                if (!hint.id) hint.id = field.id + '-hint';
                field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), hint.id].filter(Boolean).join(' '));
            }
        }
        function showError() {
            const id = field.id + '-error';
            let error = document.getElementById(id);
            if (field.validity.valid) {
                field.removeAttribute('aria-invalid');
                if (error) error.hidden = true;
                return;
            }
            field.setAttribute('aria-invalid', 'true');
            if (!error) {
                error = document.createElement('span');
                error.id = id;
                error.className = 'field-error';
                error.setAttribute('aria-live', 'polite');
                (group || field.parentElement).append(error);
                field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), id].filter(Boolean).join(' '));
            }
            error.textContent = field.validationMessage;
            error.hidden = false;
        }
        field.addEventListener('invalid', showError);
        field.addEventListener('blur', () => { if (field.value || field.getAttribute('aria-invalid')) showError(); });
        field.addEventListener('input', () => { if (field.getAttribute('aria-invalid')) showError(); });
    });
    document.querySelectorAll('button').forEach(button => {
        if (!button.textContent.trim() && !button.hasAttribute('aria-label')) {
            button.setAttribute('aria-label', button.title || (button.querySelector('.fa-xmark') ? 'Close dialog' : 'Toggle password visibility'));
        }
    });
    document.querySelectorAll('.alert').forEach(alert => {
        if (!alert.hasAttribute('role')) alert.setAttribute('role', alert.classList.contains('alert-danger') ? 'alert' : 'status');
    });
    // Wait until all original submit handlers (including confirmations) have run. Never disable named controls.
    document.addEventListener('submit', event => {
        const form = event.target;
        if (event.defaultPrevented || form.method.toLowerCase() !== 'post') return;
        if (form.dataset.uiSubmitting === '1') { event.preventDefault(); return; }
        form.dataset.uiSubmitting = '1';
        form.setAttribute('aria-busy', 'true');
        const button = event.submitter || form.querySelector('[type="submit"]');
        if (button) {
            button.setAttribute('aria-busy', 'true');
            button.setAttribute('aria-disabled', 'true');
        }
    });
    window.addEventListener('pageshow', () => {
        document.querySelectorAll('[data-ui-submitting]').forEach(form => {
            delete form.dataset.uiSubmitting;
            form.removeAttribute('aria-busy');
            form.querySelectorAll('[aria-busy]').forEach(button => { button.removeAttribute('aria-busy'); button.removeAttribute('aria-disabled'); });
        });
    });

    // Dialog accessibility is layered over original open/close functions, not a replacement for claim workflows.
    const dialogSelector = '#claimAyudaModal, #resetPasswordModal, #oversightInterventionModal, #claimHistoryDetailModal, #rejectReportModal, #xaiExplanationModal, .cal-modal-backdrop';
    document.querySelectorAll(dialogSelector).forEach((dialog, index) => {
        dialog.classList.add('ui-dialog');
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.querySelectorAll('[role="dialog"]').forEach(nested => { nested.removeAttribute('role'); nested.removeAttribute('aria-modal'); });
        const heading = dialog.querySelector('h3, h2, [id*="Title"], [id*="title"]');
        if (heading) {
            if (!heading.id) heading.id = 'ui-dialog-title-' + index;
            dialog.setAttribute('aria-labelledby', heading.id);
        } else dialog.setAttribute('aria-label', 'Details and confirmation');
        const isOpen = () => getComputedStyle(dialog).display !== 'none' && (!dialog.classList.contains('cal-modal-backdrop') || dialog.classList.contains('is-open'));
        let wasOpen = false, returnFocus = null;
        let inertSiblings = [];
        function sync() {
            const open = isOpen();
            dialog.setAttribute('aria-hidden', String(!open));
            dialog.inert = !open;
            if (open && !wasOpen) {
                returnFocus = document.activeElement;
                let child = dialog;
                while (child && child !== document.body) {
                    [...child.parentElement.children].filter(sibling => sibling !== child && !['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)).forEach(sibling => {
                        inertSiblings.push([sibling, sibling.inert]); sibling.inert = true;
                    });
                    child = child.parentElement;
                }
                const items = focusable(dialog);
                if (items.length) items[0].focus();
            } else if (!open && wasOpen) {
                inertSiblings.forEach(([sibling, inert]) => sibling.inert = inert);
                inertSiblings = [];
                if (returnFocus && returnFocus.isConnected) returnFocus.focus();
            }
            wasOpen = open;
        }
        function closeDialog() {
            const closeButton = [...dialog.querySelectorAll('button[type="button"]')].find(button => /close|cancel/i.test(button.textContent + ' ' + button.getAttribute('aria-label')));
            if (closeButton) closeButton.click();
        }
        new MutationObserver(sync).observe(dialog, { attributes: true, attributeFilter: ['style', 'class'] });
        dialog.addEventListener('keydown', event => {
            if (!isOpen()) return;
            if (event.key === 'Escape') { event.preventDefault(); closeDialog(); }
            if (event.key === 'Tab') {
                const items = focusable(dialog);
                if (!items.length) return;
                if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[items.length - 1].focus(); }
                else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
            }
        });
        sync();
    });

    document.querySelectorAll('.cal-day-cell[onclick]').forEach(cell => {
        cell.tabIndex = 0;
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-label', (cell.title || cell.textContent.trim().replace(/\s+/g, ' ')) + ' — view day details');
        cell.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); cell.click(); } });
    });
    [['residentSearchInput', 'filterResidentTables'], ['oversightSearchInput', 'filterOversightTable']].forEach(([id, handler]) => {
        const input = document.getElementById(id);
        if (input && typeof window[handler] === 'function') input.addEventListener('input', () => window[handler]());
    });
    document.querySelectorAll('.tab-btn, #resourceTabGroup button').forEach(button => {
        const sync = () => button.setAttribute('aria-pressed', String(button.classList.contains('btn-primary')));
        new MutationObserver(sync).observe(button, { attributes: true, attributeFilter: ['class'] });
        sync();
    });
    // Add client-side tools only to static, complete tables. Existing resident/oversight searches remain untouched.
    document.querySelectorAll('.table-responsive').forEach((wrapper, tableIndex) => {
        const table = wrapper.querySelector('table.table');
        if (!table) return;
        wrapper.tabIndex = 0;
        wrapper.setAttribute('role', 'region');
        const title = wrapper.closest('.card, .hub-card, .oversight-card')?.querySelector('.card-title, .hub-card-title, h3');
        const name = title?.textContent.trim() || 'Records';
        wrapper.setAttribute('aria-label', name + ' — scroll horizontally for all columns');
        table.querySelectorAll('thead th').forEach(th => th.scope = 'col');
        const columns = table.querySelectorAll('thead th').length;
        table.style.minWidth = (columns >= 8 ? 1080 : columns >= 5 ? 720 : columns >= 3 ? 520 : 360) + 'px';
        const scrollNote = document.createElement('div');
        scrollNote.className = 'table-scroll-note';
        scrollNote.textContent = 'Scroll horizontally to view every column and action.';
        wrapper.before(scrollNote);
        const updateScrollNote = () => { scrollNote.hidden = table.scrollWidth <= wrapper.clientWidth + 2; };
        if (typeof ResizeObserver !== 'undefined') new ResizeObserver(updateScrollNote).observe(wrapper);
        updateScrollNote();
        const rows = [...table.querySelectorAll('tbody > tr')].filter(row => !row.querySelector('td[colspan]'));
        if (table.id === 'oversightTable' || table.classList.contains('resident-table') || table.querySelector('.resident-row') || rows.length < 8) return;
        const tools = document.createElement('div');
        tools.className = 'table-tools';
        const label = document.createElement('label');
        label.textContent = 'Search these records';
        const search = document.createElement('input');
        search.type = 'search'; search.className = 'form-control'; search.placeholder = 'Type to filter…';
        search.id = 'ui-table-search-' + tableIndex; label.htmlFor = search.id; label.append(search);
        const count = document.createElement('span'); count.className = 'table-count'; count.setAttribute('role', 'status');
        tools.append(label, count);
        wrapper.before(tools);
        const pager = document.createElement('div'); pager.className = 'table-pagination';
        const prev = document.createElement('button'), next = document.createElement('button');
        [prev, next].forEach(button => { button.type = 'button'; button.className = 'btn btn-outline btn-sm'; });
        prev.textContent = 'Previous'; next.textContent = 'Next';
        const pageLabel = document.createElement('span'); pageLabel.className = 'table-count';
        pager.append(prev, pageLabel, next); wrapper.after(pager);
        const empty = document.createElement('tr'); empty.className = 'empty-search';
        const emptyCell = document.createElement('td'); emptyCell.colSpan = table.querySelectorAll('thead th').length;
        emptyCell.textContent = 'No matching records. Try another search.'; empty.append(emptyCell); table.tBodies[0].append(empty);
        let page = 0;
        function render() {
            const query = search.value.trim().toLocaleLowerCase();
            const matching = rows.filter(row => row.textContent.toLocaleLowerCase().includes(query));
            const pages = Math.max(1, Math.ceil(matching.length / 15));
            page = Math.min(page, pages - 1);
            const visible = new Set(matching.slice(page * 15, (page + 1) * 15));
            rows.forEach(row => row.hidden = !visible.has(row));
            empty.hidden = matching.length > 0;
            count.textContent = matching.length + ' of ' + rows.length + ' records';
            pageLabel.textContent = 'Page ' + (page + 1) + ' of ' + pages;
            prev.disabled = page === 0; next.disabled = page === pages - 1;
            pager.hidden = matching.length <= 15;
        }
        search.addEventListener('input', () => { page = 0; render(); });
        prev.addEventListener('click', () => { page--; render(); });
        next.addEventListener('click', () => { page++; render(); });
        render();
    });
});
