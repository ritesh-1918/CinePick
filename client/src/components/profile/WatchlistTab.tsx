import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, MoreVertical, Trash2, PlayCircle, GripVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WatchlistTab({ userId }) {
    const [watchlists, setWatchlists] = useState([]);
    const [activeListId, setActiveListId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWatchlists();
    }, [userId]);

    const fetchWatchlists = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/watchlist/${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success && data.watchlist) {
                setWatchlists(data.watchlist.lists);
                if (!activeListId && data.watchlist.lists.length > 0) {
                    setActiveListId(data.watchlist.lists[0].listId);
                }
            }
        } catch (error) {
            console.error('Error fetching watchlists:', error);
            toast.error('Failed to load watchlists');
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const activeListIndex = watchlists.findIndex(l => l.listId === activeListId);
        if (activeListIndex === -1) return;

        const newMovies = Array.from(watchlists[activeListIndex].movies);
        const [reorderedItem] = newMovies.splice(result.source.index, 1);
        newMovies.splice(result.destination.index, 0, reorderedItem);

        // Optimistic update
        const newWatchlists = [...watchlists];
        newWatchlists[activeListIndex].movies = newMovies;
        setWatchlists(newWatchlists);

        // API Call
        try {
            await fetch(`http://localhost:5000/api/watchlist/${userId}/${activeListId}/reorder`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ movies: newMovies })
            });
        } catch (error) {
            console.error('Reorder failed:', error);
            toast.error('Failed to save order');
            fetchWatchlists(); // Revert on error
        }
    };

    const activeList = watchlists.find(l => l.listId === activeListId);

    if (loading) return <div className="text-center py-10">Loading watchlists...</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - List of Watchlists */}
            <div className="w-full lg:w-1/4 space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">My Lists</h3>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Plus size={20} />
                    </button>
                </div>
                <div className="space-y-2">
                    {watchlists.map(list => (
                        <button
                            key={list.listId}
                            onClick={() => setActiveListId(list.listId)}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex justify-between items-center ${activeListId === list.listId
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-card/50 hover:bg-white/5 text-muted-foreground hover:text-white'
                                }`}
                        >
                            <span className="font-medium">{list.listName}</span>
                            <span className="text-xs opacity-70 bg-black/20 px-2 py-1 rounded-full">
                                {list.movies.length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content - Movies in List */}
            <div className="flex-1 bg-card/50 rounded-2xl border border-white/10 p-6 min-h-[500px]">
                {activeList ? (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">{activeList.listName}</h2>
                                <p className="text-sm text-muted-foreground">
                                    Created {new Date(activeList.createdDate).toLocaleDateString()}
                                </p>
                            </div>
                            <button className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
                                Share List
                            </button>
                        </div>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="movies">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-3"
                                    >
                                        {activeList.movies.length === 0 ? (
                                            <div className="text-center py-20 text-muted-foreground">
                                                <p>No movies in this list yet.</p>
                                                <button className="mt-4 text-primary hover:underline">Browse Movies</button>
                                            </div>
                                        ) : (
                                            activeList.movies.map((movie, index) => (
                                                <Draggable key={movie.movieId} draggableId={movie.movieId} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className="bg-background/50 p-4 rounded-xl border border-white/5 flex items-center gap-4 group hover:border-primary/30 transition-colors"
                                                        >
                                                            <div {...provided.dragHandleProps} className="text-muted-foreground hover:text-white cursor-grab">
                                                                <GripVertical size={20} />
                                                            </div>

                                                            <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                                                {/* Placeholder for poster */}
                                                            </div>

                                                            <div className="flex-1">
                                                                <h4 className="font-semibold">Movie ID: {movie.movieId}</h4>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                                    {movie.moodTag && (
                                                                        <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                                                                            {movie.moodTag}
                                                                        </span>
                                                                    )}
                                                                    <span>Added {new Date(movie.addedDate).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button className="p-2 hover:bg-white/10 rounded-full text-red-500">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                                <button className="p-2 hover:bg-white/10 rounded-full">
                                                                    <MoreVertical size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Select a watchlist to view
                    </div>
                )}
            </div>
        </div>
    );
}
