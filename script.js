document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const audioPlayer = document.getElementById('audioPlayer');
    const volumeSlider = document.querySelector('.volume-slider');
    const trackTitle = document.getElementById('trackTitle');
    const trackArtist = document.getElementById('trackArtist');
    const progressBar = document.querySelector('.progress-bar-fill');
    const currentTime = document.getElementById('currentTime');
    const listenerCount = document.getElementById('listenerCount');
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

    // Configurar el volumen inicial del reproductor de audio
    audioPlayer.volume = volumeSlider.value / 100;

    // Event Listener para controlar el volumen
    volumeSlider.addEventListener('input', () => {
        audioPlayer.volume = volumeSlider.value / 100;
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
    });

    // Reset del ícono cuando termina la canción (aunque el loop no lo permitirá)
    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayPauseIcon(isPlaying);
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
        }

        // Controlar el volumen con las flechas hacia arriba y hacia abajo
        if (event.code === 'ArrowUp') {
            event.preventDefault();
            if (audioPlayer.volume < 1) {
                audioPlayer.volume = Math.min(audioPlayer.volume + 0.1, 1); // Aumenta el volumen en 0.1
                volumeSlider.value = audioPlayer.volume * 100; // Actualiza el slider de volumen
            }
        }
        if (event.code === 'ArrowDown') {
            event.preventDefault();
            if (audioPlayer.volume > 0) {
                audioPlayer.volume = Math.max(audioPlayer.volume - 0.1, 0); // Disminuye el volumen en 0.1
                volumeSlider.value = audioPlayer.volume * 100; // Actualiza el slider de volumen
            }
        }
    });

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
            }, 300);

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
                }, 300);
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

