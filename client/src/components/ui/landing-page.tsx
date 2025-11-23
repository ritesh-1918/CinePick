import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";


import Globe from "@/components/ui/globe";
import { cn } from "@/lib/utils";

// Reusable ScrollGlobe component following shadcn/ui patterns
interface ScrollGlobeProps {
    sections: {
        id: string;
        badge?: string;
        title: string;
        subtitle?: string;
        description: string;
        align?: 'left' | 'center' | 'right';
        features?: { title: string; description: string }[];
        actions?: { label: string; variant: 'primary' | 'secondary'; onClick?: () => void }[];
    }[];
    globeConfig?: {
        positions: {
            top: string;
            left: string;
            scale: number;
        }[];
    };
    className?: string;
}

const defaultGlobeConfig = {
    positions: [
        { top: "50%", left: "75%", scale: 1.4 },  // Hero: Right side, balanced
        { top: "25%", left: "50%", scale: 0.9 },  // Innovation: Top side, subtle
        { top: "15%", left: "90%", scale: 2 },  // Discovery: Left side, medium
        { top: "50%", left: "50%", scale: 1.8 },  // Future: Center, large backdrop
    ]
};

// Parse percentage string to number
const parsePercent = (str: string): number => parseFloat(str.replace('%', ''));

export function ScrollGlobe({ sections, globeConfig = defaultGlobeConfig, className }: ScrollGlobeProps) {
    const [activeSection, setActiveSection] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [globeTransform, setGlobeTransform] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLElement | null)[]>([]);
    const animationFrameId = useRef<number | null>(null);
    const navLabelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Pre-calculate positions for performance
    const calculatedPositions = useMemo(() => {
        return globeConfig.positions.map(pos => ({
            top: parsePercent(pos.top),
            left: parsePercent(pos.left),
            scale: pos.scale
        }));
    }, [globeConfig.positions]);

    // Simple, direct scroll tracking
    const updateScrollPosition = useCallback(() => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);

        setScrollProgress(progress);

        // Simple section detection
        const viewportCenter = window.innerHeight / 2;
        let newActiveSection = 0;
        let minDistance = Infinity;

        sectionRefs.current.forEach((ref, index) => {
            if (ref) {
                const rect = ref.getBoundingClientRect();
                const sectionCenter = rect.top + rect.height / 2;
                const distance = Math.abs(sectionCenter - viewportCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    newActiveSection = index;
                }
            }
        });

        // Direct position update - no interpolation
        const currentPos = calculatedPositions[newActiveSection];
        const transform = `translate3d(${currentPos.left}vw, ${currentPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${currentPos.scale}, ${currentPos.scale}, 1)`;

        setGlobeTransform(transform);

        setActiveSection(newActiveSection);
    }, [calculatedPositions, activeSection]);

    // Throttled scroll handler with RAF
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                animationFrameId.current = requestAnimationFrame(() => {
                    updateScrollPosition();
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Use passive listeners and immediate execution
        window.addEventListener("scroll", handleScroll, { passive: true });
        updateScrollPosition(); // Initial call

        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            if (navLabelTimeoutRef.current) {
                clearTimeout(navLabelTimeoutRef.current);
            }
        };
    }, [updateScrollPosition]);

    // Initial globe position
    useEffect(() => {
        const initialPos = calculatedPositions[0];
        const initialTransform = `translate3d(${initialPos.left}vw, ${initialPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${initialPos.scale}, ${initialPos.scale}, 1)`;
        setGlobeTransform(initialTransform);
    }, [calculatedPositions]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full max-w-screen overflow-x-hidden min-h-screen bg-background text-foreground",
                className
            )}
        >
            {/* Logo */}
            <div className="fixed top-6 left-6 z-50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-xl backdrop-blur-sm border border-primary/20">
                        <img src="/logo.png" alt="CinePick Logo" className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        CinePick
                    </h1>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-0.5 bg-gradient-to-r from-border/20 via-border/40 to-border/20 z-50">
                <div
                    className="h-full bg-gradient-to-r from-primary via-blue-600 to-blue-900 will-change-transform shadow-sm"
                    style={{
                        transform: `scaleX(${scrollProgress})`,
                        transformOrigin: 'left center',
                        transition: 'transform 0.15s ease-out',
                        filter: 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.3))'
                    }}
                />
            </div>

            {/* Enhanced Navigation with auto-hiding labels - Fully Responsive */}
            <div className="hidden sm:flex fixed right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40">
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {sections.map((section, index) => (
                        <div key={index} className="relative group">
                            {/* Auto-hiding section label - Always visible but with responsive sizing */}


                            <button
                                onClick={() => {
                                    sectionRefs.current[index]?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'center'
                                    });
                                }}
                                className={cn(
                                    "relative w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full border-2 transition-all duration-300 hover:scale-125",
                                    "before:absolute before:inset-0 before:rounded-full before:transition-all before:duration-300",
                                    activeSection === index
                                        ? "bg-primary border-primary shadow-lg before:animate-ping before:bg-primary/20"
                                        : "bg-transparent border-muted-foreground/40 hover:border-primary/60 hover:bg-primary/10"
                                )}
                                aria-label={`Go to ${section.badge || `section ${index + 1}`}`}
                            />
                        </div>
                    ))}
                </div>

                {/* Enhanced navigation line - Responsive */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 lg:w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent -translate-x-1/2 -z-10" />
            </div>

            {/* Ultra-smooth Globe with responsive scaling */}
            <div
                className="fixed z-10 pointer-events-none will-change-transform transition-all duration-[1400ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
                style={{
                    transform: globeTransform,
                    filter: `opacity(${activeSection === 3 ? 0.4 : 0.85})`, // Subtle opacity for backdrop effect
                }}
            >
                <div className="scale-75 sm:scale-90 lg:scale-100">
                    <Globe />
                </div>
            </div>

            {/* Dynamic sections - fully responsive */}
            {sections.map((section, index) => (
                <section
                    key={section.id}
                    ref={(el) => { sectionRefs.current[index] = el; }}
                    className={cn(
                        "relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 z-20 py-12 sm:py-16 lg:py-20",
                        "w-full max-w-full overflow-hidden",
                        section.align === 'center' && "items-center text-center",
                        section.align === 'right' && "items-end text-right",
                        section.align !== 'center' && section.align !== 'right' && "items-start text-left"
                    )}
                >
                    <div className={cn(
                        "w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl will-change-transform transition-all duration-700",
                        "opacity-100 translate-y-0"
                    )}>

                        <h1 className={cn(
                            "font-bold mb-6 sm:mb-8 leading-[1.1] tracking-tight",
                            index === 0
                                ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
                                : "text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl"
                        )}>
                            {section.subtitle ? (
                                <div className="space-y-1 sm:space-y-2">
                                    <div className="text-white drop-shadow-lg">
                                        {section.title}
                                    </div>
                                    <div className="text-gray-200 text-[0.6em] sm:text-[0.7em] font-medium tracking-wider drop-shadow-md">
                                        {section.subtitle}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-white drop-shadow-lg">
                                    {section.title}
                                </div>
                            )}
                        </h1>

                        <div className={cn(
                            "text-muted-foreground/80 leading-relaxed mb-8 sm:mb-10 text-base sm:text-lg lg:text-xl font-light",
                            section.align === 'center' ? "max-w-full mx-auto text-center" : "max-w-full"
                        )}>
                            <p className="mb-3 sm:mb-4">{section.description}</p>

                        </div>

                        {/* Enhanced Features - Responsive grid */}
                        {section.features && (
                            <div className="grid gap-3 sm:gap-4 mb-8 sm:mb-10">
                                {section.features.map((feature, featureIndex) => (
                                    <div
                                        key={feature.title}
                                        className={cn(
                                            "group p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5",
                                            "hover:border-primary/20 hover:-translate-y-1"
                                        )}
                                        style={{ animationDelay: `${featureIndex * 0.1}s` }}
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-primary/60 mt-1.5 sm:mt-2 group-hover:bg-primary transition-colors flex-shrink-0" />
                                            <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                                                <h3 className="font-semibold text-card-foreground text-base sm:text-lg">{feature.title}</h3>
                                                <p className="text-muted-foreground/80 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Enhanced Actions - Responsive buttons */}
                        {section.actions && (
                            <div className={cn(
                                "flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4",
                                section.align === 'center' && "justify-center",
                                section.align === 'right' && "justify-end",
                                (!section.align || section.align === 'left') && "justify-start"
                            )}>
                                {section.actions.map((action, actionIndex) => (
                                    <button
                                        key={action.label}
                                        onClick={action.onClick}
                                        className={cn(
                                            "group relative px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base",
                                            "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-auto",
                                            action.variant === 'primary'
                                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                                                : "border-2 border-border/60 bg-background/50 backdrop-blur-sm hover:bg-accent/50 hover:border-primary/30 text-foreground"
                                        )}
                                        style={{ animationDelay: `${actionIndex * 0.1 + 0.2}s` }}
                                    >
                                        <span className="relative z-10">{action.label}</span>
                                        {action.variant === 'primary' && (
                                            <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            ))}
        </div>
    );
}

export default ScrollGlobe;
