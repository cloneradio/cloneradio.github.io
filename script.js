document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('ready');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const audioPlayer = document.getElementById('audioPlayer');
    const volumeSlider = document.querySelector('.volume-slider');
    const trackTitle = document.getElementById('trackTitle');
    const trackArtist = document.getElementById('trackArtist');
    const progressBar = document.querySelector('.progress-bar-fill');
    const currentTime = document.getElementById('currentTime');
    const listenerCount = document.getElementById('listenerCount');
    const volumeIcon = document.querySelector('.volume-icon');
    let isPlaying = false;
    let currentSongData = null;
    let updateTimer = null;
    let songStartTime = 0;
    let progressInterval = null;

    // Función para actualizar el ícono de play/pause
    const updatePlayPauseIcon = (playing) => {
        playPauseBtn.innerHTML = playing
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>`;
    };

    // Configurar el volumen inicial del reproductor de audio y CSS del slider
    const setSliderPercent = (val) => {
        const clamped = Math.max(0, Math.min(100, Number(val)));
        volumeSlider.style.setProperty('--value', clamped);
    };
    audioPlayer.volume = volumeSlider.value / 100;
    setSliderPercent(volumeSlider.value);

    const setVolumeIcon = () => {
        const v = Math.round(audioPlayer.volume * 100);
        if (!volumeIcon) return;
        if (v === 0) {
            // Mute: altavoz con una X
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="16" y1="8" x2="22" y2="14"></line>
                <line x1="22" y1="8" x2="16" y2="14"></line>
            `;
            return;
        }

        // Niveles: bajo (1 onda), medio (2 ondas), alto (3 ondas)
        if (v > 0 && v <= 33) {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            `;
            return;
        }
        if (v > 33 && v <= 66) {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            `;
            return;
        }
        // Alto (3 ondas)
        volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            <path d="M22.1 2a13 13 0 0 1 0 20"></path>
        `;
    };
    setVolumeIcon();

    // Guardar último volumen distinto de 0 para restaurar al desmutear
    let lastNonZeroVolume = audioPlayer.volume > 0 ? audioPlayer.volume : 0.5;

    // Click sobre el icono: mute/desmute
    if (volumeIcon) {
        volumeIcon.style.cursor = 'pointer';
        volumeIcon.addEventListener('click', () => {
            if (audioPlayer.volume === 0) {
                // restaurar
                audioPlayer.volume = Math.max(0.01, Math.min(1, lastNonZeroVolume));
                volumeSlider.value = Math.round(audioPlayer.volume * 100);
                setSliderPercent(volumeSlider.value);
                setVolumeIcon();
            } else {
                // guardar y mutear
                lastNonZeroVolume = audioPlayer.volume;
                audioPlayer.volume = 0;
                volumeSlider.value = 0;
                setSliderPercent(0);
                setVolumeIcon();
            }
        });
    }

    // Event Listener para controlar el volumen
    volumeSlider.addEventListener('input', () => {
        audioPlayer.volume = volumeSlider.value / 100;
        setSliderPercent(volumeSlider.value);
    setVolumeIcon();
    });

    // Event Listener para play/pause al hacer clic en el botón
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play();
        }
        isPlaying = !isPlaying;
        updatePlayPauseIcon(isPlaying);
    document.body.classList.toggle('is-playing', isPlaying);
    });

    // Reset del ícono cuando termina la canción (aunque el loop no lo permitirá)
    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayPauseIcon(isPlaying);
    document.body.classList.remove('is-playing');
    });

    // Event Listener para play/pause con la tecla Espacio
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault(); // Evita que la tecla espacio haga scroll en la página
            if (isPlaying) {
                audioPlayer.pause();
            } else {
                audioPlayer.play();
            }
            isPlaying = !isPlaying;
            updatePlayPauseIcon(isPlaying);
            document.body.classList.toggle('is-playing', isPlaying);
        }

        // Controlar el volumen con las flechas hacia arriba y hacia abajo
        if (event.code === 'ArrowUp') {
            event.preventDefault();
            if (audioPlayer.volume < 1) {
                audioPlayer.volume = Math.min(audioPlayer.volume + 0.1, 1); // Aumenta el volumen en 0.1
                volumeSlider.value = Math.round(audioPlayer.volume * 100); // Actualiza el slider de volumen
                setSliderPercent(volumeSlider.value);
                setVolumeIcon();
            }
        }
        if (event.code === 'ArrowDown') {
            event.preventDefault();
            if (audioPlayer.volume > 0) {
                audioPlayer.volume = Math.max(audioPlayer.volume - 0.1, 0); // Disminuye el volumen en 0.1
                volumeSlider.value = Math.round(audioPlayer.volume * 100); // Actualiza el slider de volumen
                setSliderPercent(volumeSlider.value);
                setVolumeIcon();
            }
        }
    });

    // ========================
    // Video del día (sin repetir ayer)
    // ========================
    const videoEl = document.getElementById('backgroundVideo');
    // Lista de fondos disponibles (videos o imágenes animadas)
    // Puedes mezclar .mp4, .webm, .gif, .webp (animada), .apng
    // Colócalos en assets/videos/ y añade aquí sus nombres.
    const availableMedia = [
        'teclear.mp4'
    ];

    const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const storageKeys = {
        day: 'bgvideo.day',
        file: 'bgvideo.file',
        yesterday: 'bgvideo.yesterday',
    };

    const pickVideoForToday = () => {
        const today = todayKey();
        try {
            const lastDay = localStorage.getItem(storageKeys.day);
            const lastFile = localStorage.getItem(storageKeys.file);
            const yesterdayFile = localStorage.getItem(storageKeys.yesterday);

            // Si ya hay video asignado hoy, úsalo
            if (lastDay === today && lastFile) {
                return lastFile;
            }

            // Elegir aleatorio evitando repetir el de ayer si hay más de 1
            let pool = [...availableMedia];
            if (yesterdayFile && pool.length > 1) {
                pool = pool.filter(v => v !== yesterdayFile);
            }
            const choice = pool[Math.floor(Math.random() * pool.length)];

            // Persistir: mover el de hoy a yesterday y guardar el nuevo
            if (lastFile) {
                localStorage.setItem(storageKeys.yesterday, lastFile);
            }
            localStorage.setItem(storageKeys.day, today);
            localStorage.setItem(storageKeys.file, choice);
            return choice;
        } catch (_) {
            // Si localStorage falla (modo privado o permisos), cae a aleatorio simple evitando repetir en sesión
            const last = videoEl?.dataset?.lastPicked;
            let pool = [...availableMedia];
            if (last && pool.length > 1) pool = pool.filter(v => v !== last);
            const choice = pool[Math.floor(Math.random() * pool.length)];
            if (videoEl) videoEl.dataset.lastPicked = choice;
            return choice;
        }
    };

    const imgEl = document.getElementById('backgroundImage');
    const isImage = (name) => /(\.gif|\.webp|\.apng)$/i.test(name);
    const isVideo = (name) => /(\.mp4|\.webm|\.ogg)$/i.test(name);

    const applyMediaOfTheDay = () => {
        const src = pickVideoForToday();
        const url = `./assets/videos/${src}`;
        if (isImage(src)) {
            if (imgEl) {
                imgEl.src = url;
                imgEl.style.display = 'block';
            }
            if (videoEl) {
                videoEl.pause?.();
                videoEl.style.display = 'none';
            }
        } else {
            // Asumimos video
            if (videoEl) {
                let source = videoEl.querySelector('source');
                if (!source) {
                    source = document.createElement('source');
                    videoEl.appendChild(source);
                }
                // Intentamos inferir mime
                const ext = src.split('.').pop().toLowerCase();
                const mime = ext === 'webm' ? 'video/webm' : ext === 'ogg' ? 'video/ogg' : 'video/mp4';
                source.type = mime;
                source.setAttribute('src', url);
                videoEl.load();
                videoEl.style.display = 'block';
                imgEl && (imgEl.style.display = 'none');
            }
        }
    };

    applyMediaOfTheDay();

    // Función para formatear tiempo en MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Función para actualizar la barra de progreso y el tiempo
    const updateProgressBar = (elapsed, duration) => {
        const progressBar = document.querySelector('.progress-bar-fill');
        const currentTime = document.getElementById('currentTime');
        const progress = (elapsed / duration) * 100;
        
        // Actualizar la barra de progreso
        progressBar.style.width = `${progress}%`;
        
        // Actualizar el tiempo transcurrido y restante
        const timeRemaining = duration - elapsed;
        currentTime.textContent = `${formatTime(elapsed)} / ${formatTime(duration)}`;
    };

    let currentSongDuration = 0;
    let currentSongStartTime = 0;

    // Función para actualizar el tiempo y progreso
    const updateTimeAndProgress = () => {
        if (currentSongData) {
            const now = Date.now();
            const elapsedSeconds = (now - songStartTime) / 1000;
            const duration = currentSongData.duration;
            
            // Actualizar el tiempo
            currentTime.textContent = `${formatTime(elapsedSeconds)} / ${formatTime(duration)}`;
            
            // Actualizar la barra de progreso
            const progress = (elapsedSeconds / duration) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
    };

    // Función para actualizar la interfaz con la nueva canción
    const updateInterface = (songData) => {
        const { title, artist, art } = songData.song;
        const { elapsed, duration } = songData;
        const albumArt = document.getElementById('albumArt');

        // Actualizar el tiempo de inicio de la canción
        songStartTime = Date.now() - (elapsed * 1000);

        // Solo actualizar la interfaz si la canción ha cambiado
        if (!currentSongData || currentSongData.song.title !== title) {
            // Actualizar título y artista con fade
            trackTitle.style.opacity = '0';
            trackArtist.style.opacity = '0';
            
            setTimeout(() => {
                trackTitle.textContent = title;
                trackArtist.textContent = artist;
                trackTitle.style.opacity = '1';
                trackArtist.style.opacity = '1';
            }, 220);

            // Actualizar carátula del álbum solo si es diferente
            if (!currentSongData || currentSongData.song.art !== art) {
                albumArt.style.opacity = '0';
                setTimeout(() => {
                    if (art) {
                        albumArt.src = art;
                        albumArt.classList.remove('hidden');
                        albumArt.style.opacity = '1';
                    } else {
                        albumArt.classList.add('hidden');
                    }
                }, 220);
            }

            // Limpiar y reiniciar el intervalo de progreso
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            progressInterval = setInterval(updateTimeAndProgress, 1000);
        }

        // Actualizar la barra de progreso inicialmente
        progressBar.style.transition = 'width 0.5s linear';
        updateTimeAndProgress();

        // Actualizar contador de oyentes
        if (songData.listeners && songData.listeners.current !== undefined) {
            const listeners = songData.listeners.current;
            listenerCount.textContent = `${listeners} listener${listeners !== 1 ? 's' : ''}`;
        }

        // Guardar datos actuales
        currentSongData = songData;
    };

    // Función para obtener información de la pista actual
    const fetchNowPlaying = async () => {
        try {
            const response = await fetch('https://coderadio-admin-v2.freecodecamp.org/api/nowplaying/coderadio');
            const data = await response.json();
            const nowPlaying = data.now_playing;
            // Añadir los listeners al objeto nowPlaying
            nowPlaying.listeners = data.listeners;

            // Actualizar la interfaz
            updateInterface(nowPlaying);

            // Calcular cuando hacer la próxima actualización
            const timeUntilEnd = (nowPlaying.duration - nowPlaying.elapsed) * 1000;
            
            // Programar la próxima actualización un poco antes del final de la canción
            clearTimeout(updateTimer);
            updateTimer = setTimeout(fetchNowPlaying, timeUntilEnd - 1000);

        } catch (error) {
            console.error('Error fetching now playing data:', error);
            // En caso de error, intentar nuevamente en 5 segundos
            updateTimer = setTimeout(fetchNowPlaying, 5000);
        }
    };

    // Función para actualizar el progreso en tiempo real
    const updateProgress = () => {
        if (currentSongDuration && currentSongStartTime) {
            const elapsed = (Date.now() - currentSongStartTime) / 1000;
            if (elapsed <= currentSongDuration) {
                updateProgressBar(elapsed, currentSongDuration);
            }
        }
    };

    // Iniciar la reproducción y primera actualización
    fetchNowPlaying();

    // Backup check cada 30 segundos por si algo falla
    setInterval(() => {
        if (!currentSongData) {
            fetchNowPlaying();
        }
    }, 30000);

    // Limpiar intervalos cuando la página se cierra
    window.addEventListener('beforeunload', () => {
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        if (updateTimer) {
            clearTimeout(updateTimer);
        }
    });


});

