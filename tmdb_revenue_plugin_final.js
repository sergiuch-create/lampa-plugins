(async () => {
    let original = Component.add;
    Component.add = function (object) {
        if (object.type === 'card' && object.data && object.data.id && object.data.name) {
            let tmdb_id = object.data.id;
            fetch(`https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=e3b2a7e9242d4fa8b4acb1f3f4f7a7dd&language=ru`)
                .then(r => r.json())
                .then(d => {
                    if (d.revenue && d.revenue > 0) {
                        let revenue = (d.revenue / 1_000_000).toFixed(1);
                        let badge = document.createElement('div');
                        badge.classList.add('tmdb-revenue-badge');
                        badge.innerText = `💰 ${revenue} млн`;
                        let element = document.querySelector(`[data-card-id="${tmdb_id}"] .card__title`);
                        if (element) element.appendChild(badge);
                    }
                })
                .catch(e => {});
        }
        return original.apply(this, arguments);
    };
})();