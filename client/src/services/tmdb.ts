import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/tmdb';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Image size configurations
export const IMAGE_SIZES = {
    poster: {
        small: 'w185',
        medium: 'w342',
        large: 'w500',
        original: 'original'
    },
    backdrop: {
        small: 'w300',
        medium: 'w780',
        large: 'w1280',
        original: 'original'
    }
};

// Movie interface
export interface Movie {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
    adult: boolean;
    original_language: string;
    video: boolean;
}

export interface MovieDetails extends Movie {
    runtime: number;
    genres: { id: number; name: string }[];
    tagline: string;
    status: string;
    budget: number;
    revenue: number;
    credits?: {
        cast: any[];
        crew: any[];
    };
    similar?: {
        results: Movie[];
    };
}

export interface Video {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
}

// Helper function to build image URL
export const getImageUrl = (path: string | null, size: string = 'original'): string => {
    if (!path) return '/placeholder-movie.png'; // Fallback image
    if (path.startsWith('http')) return path; // Return full URL if already present
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

// API Functions
export const tmdbApi = {
    // Get trending movies
    getTrending: async (timeWindow: 'day' | 'week' = 'week') => {
        const response = await axios.get(`${API_BASE_URL}/trending`, {
            params: { time_window: timeWindow }
        });
        return response.data.data;
    },

    // Get popular movies
    getPopular: async (page: number = 1) => {
        const response = await axios.get(`${API_BASE_URL}/popular`, {
            params: { page }
        });
        return response.data.data;
    },

    // Get top rated movies
    getTopRated: async (page: number = 1) => {
        const response = await axios.get(`${API_BASE_URL}/top-rated`, {
            params: { page }
        });
        return response.data.data;
    },

    // Get now playing movies
    getNowPlaying: async (page: number = 1) => {
        const response = await axios.get(`${API_BASE_URL}/now-playing`, {
            params: { page }
        });
        return response.data.data;
    },

    // Search movies
    searchMovies: async (query: string, page: number = 1) => {
        const response = await axios.get(`${API_BASE_URL}/search`, {
            params: { query, page }
        });
        return response.data.data;
    },

    // Get movie details
    getMovieDetails: async (movieId: number) => {
        const response = await axios.get(`${API_BASE_URL}/movie/${movieId}`);
        return response.data.data;
    },

    // Get movie videos/trailers
    getMovieVideos: async (movieId: number) => {
        const response = await axios.get(`${API_BASE_URL}/movie/${movieId}/videos`);
        return response.data.data;
    },

    // Discover movies with filters
    discoverMovies: async (filters: {
        with_genres?: string;
        year?: number;
        'vote_average.gte'?: number;
        'vote_average.lte'?: number;
        'with_runtime.gte'?: number;
        'with_runtime.lte'?: number;
        with_original_language?: string;
        sort_by?: string;
        page?: number;
    }) => {
        const response = await axios.get(`${API_BASE_URL}/discover`, { params: filters });
        return response.data.data;
    },

    // Get genres list
    getGenres: async () => {
        const response = await axios.get(`${API_BASE_URL}/genres`);
        return response.data.data;
    },

    // Get upcoming movies
    getUpcoming: async (page: number = 1) => {
        const response = await axios.get(`${API_BASE_URL}/upcoming`, {
            params: { page }
        });
        return response.data.data;
    },

    // Get movie recommendations
    getRecommendations: async (movieId: number, page: number = 1) => {
        const response = await axios.get(`${API_BASE_URL}/movie/${movieId}/recommendations`, {
            params: { page }
        });
        return response.data.data;
    },

    // Get similar movies
    getSimilarMovies: async (movieId: number, page: number = 1) => {
        const response = await axios.get(`${API_BASE_URL}/movie/${movieId}/similar`, {
            params: { page }
        });
        return response.data.data;
    }
};

export default tmdbApi;
