(async () => {
    function formatRevenue(value) {
        return '💰 ' + (value / 1_000_000).toFixed(1) + ' млн $';
    }

    function addBadgeToCard(tmdb_id, revenue) {
        let badge = document.createElement('div');
        badge.classList.add('tmdb-revenue-badge');
        badge.innerText = formatRevenue(revenue);
        let element = document.querySelector(`[data-card-id="${tmdb_id}"] .card__title`);
        if (element) element.appendChild(badge);
    }

    function addRevenueToDetail(revenue) {
        let container = document.querySelector('.full-start__right .full-start__list');
        if (container && !document.querySelector('.revenue-line')) {
            let div = document.createElement('div');
            div.classList.add('full-start__line', 'revenue-line');
            div.innerHTML = '<div class="full-start__label">Сборы</div><div class="full-start__value">' + formatRevenue(revenue) + '</div>';
            container.appendChild(div);
        }
    }

    let original = Component.add;
    Component.add = function (object) {
        if (object.type === 'card' && object.data && object.data.id) {
            let tmdb_id = object.data.id;
            fetch(`https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=e3b2a7e9242d4fa8b4acb1f3f4f7a7dd&language=ru`)
                .then(r => r.json())
                .then(d => {
                    if (d.revenue && d.revenue > 0) {
                        addBadgeToCard(tmdb_id, d.revenue);
                    }
                })
                .catch(() => {});
        }
        return original.apply(this, arguments);
    };

    // Если пользователь в детальной карточке, получим id из адреса и вставим блок
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