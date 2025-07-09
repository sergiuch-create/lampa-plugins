(async () => {
    function formatRevenue(value) {
        return '💰 ' + (value / 1_000_000).toFixed(1) + ' млн $';
    }

    function addBadgeToCard(tmdb_id, revenue) {
        let observer = new MutationObserver(() => {
            let element = document.querySelector(`[data-card-id="${tmdb_id}"] .card__title`);
            if (element && !element.querySelector('.tmdb-revenue-badge')) {
                let badge = document.createElement('div');
                badge.classList.add('tmdb-revenue-badge');
                badge.style.cssText = 'font-size:12px;color:#fff;background:#444;padding:2px 4px;margin-top:4px;border-radius:4px;';
                badge.innerText = formatRevenue(revenue);
                element.appendChild(badge);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function addRevenueToDetail(revenue) {
        let tryInsert = () => {
            let container = document.querySelector('.full-start__right .full-start__list');
            if (container && !document.querySelector('.revenue-line')) {
                let div = document.createElement('div');
                div.classList.add('full-start__line', 'revenue-line');
                div.innerHTML = '<div class="full-start__label">Сборы</div><div class="full-start__value">' + formatRevenue(revenue) + '</div>';
                container.appendChild(div);
                return true;
            }
            return false;
        };
        let attempts = 0;
        let interval = setInterval(() => {
            if (tryInsert() || ++attempts > 20) clearInterval(interval);
        }, 300);
    }

    let original = Component.add;
    Component.add = function (object) {
        try {
            if (object.type === 'card' && object.data) {
                let tmdb_id = object.data.ids?.tmdb || object.data.tmdb_id || object.data.id;
                if (tmdb_id) {
                    fetch(`https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=e3b2a7e9242d4fa8b4acb1f3f4f7a7dd&language=ru`)
                        .then(r => r.json())
                        .then(d => {
                            if (d.revenue && d.revenue > 0) {
                                addBadgeToCard(tmdb_id, d.revenue);
                            }
                        })
                        .catch(() => {});
                }
            }
        } catch (e) {}
        return original.apply(this, arguments);
    };

    // Отображение на детальной странице
    let idMatch = location.pathname.match(/movie\/(\d+)/);
    if (idMatch) {
        let tmdb_id = idMatch[1];
        fetch(`https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=e3b2a7e9242d4fa8b4acb1f3f4f7a7dd&language=ru`)
            .then(r => r.json())
            .then(d => {
                if (d.revenue && d.revenue > 0) {
                    addRevenueToDetail(d.revenue);
                }
            })
            .catch(() => {});
    }
})();