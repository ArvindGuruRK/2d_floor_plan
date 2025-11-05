
import React, { useState, useEffect, useCallback } from 'react';
import { generateFloorPlans } from './services/geminiService';

// TYPE DEFINITIONS
export type Units = 'metric' | 'imperial';

export interface FloorPlanRequirements {
  plotSize: number;
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchens: number;
  hasDining: boolean;
  hasBalcony: boolean;
  hasParking: boolean;
}

// HELPER UI COMPONENTS

const UnitsToggle = ({ value, onToggle }: { value: Units, onToggle: (value: Units) => void }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-2">Units</label>
    <div className="flex bg-slate-800/50 p-1 rounded-lg">
        <button onClick={() => onToggle('metric')} className={`flex-1 text-center text-sm py-1.5 rounded-md transition-colors ${value === 'metric' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:bg-slate-700'}`}>Metric</button>
        <button onClick={() => onToggle('imperial')} className={`flex-1 text-center text-sm py-1.5 rounded-md transition-colors ${value === 'imperial' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:bg-slate-700'}`}>Imperial</button>
    </div>
  </div>
);

// Fix: Changed component to be of type React.FC and defined props with an interface to allow for the 'key' prop used in loops.
interface RoomStepperProps {
    label: string;
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

const RoomStepper: React.FC<RoomStepperProps> = ({ label, value, onIncrement, onDecrement }) => (
    <div className="flex justify-between items-center">
        <label className="text-sm text-slate-300">{label}</label>
        <div className="flex items-center gap-4 bg-slate-800/50 rounded-md p-1">
            <button type="button" onClick={onDecrement} className="px-2 py-1 rounded text-slate-400 hover:bg-slate-700 disabled:opacity-50" disabled={value <= 0}>-</button>
            <span className="font-medium w-4 text-center text-sm">{value}</span>
            <button type="button" onClick={onIncrement} className="px-2 py-1 rounded text-slate-400 hover:bg-slate-700">+</button>
        </div>
    </div>
);

// Fix: Changed component to be of type React.FC and defined props with an interface to allow for the 'key' prop used in loops.
interface FeatureToggleProps {
    label: string;
    value: boolean;
    onToggle: (value: boolean) => void;
}
const FeatureToggle: React.FC<FeatureToggleProps> = ({ label, value, onToggle }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-slate-300">{label}</span>
        <div className="flex rounded-md bg-slate-800/50 p-1">
            <button type="button" onClick={() => onToggle(true)} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${value ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:bg-slate-700'}`}>Yes</button>
            <button type="button" onClick={() => onToggle(false)} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${!value ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:bg-slate-700'}`}>No</button>
        </div>
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        <h3 className="text-xl font-semibold text-slate-200">Design Your Space</h3>
        <p className="mt-1 max-w-xs">Use the panel on the left to configure your requirements and click 'Generate Plans' to begin.</p>
    </div>
);

const Loader = () => {
    const messages = [
        "Sketching initial concepts...", "Arranging rooms and spaces...", "Adding architectural details...",
        "Rendering high-resolution plans...", "Almost there, finalizing layouts..."
    ];
    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(messages[Math.floor(Math.random() * messages.length)]);
        }, 2500);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="animate-spin h-10 w-10 text-pink-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-medium text-slate-200">Drafting your floor plans</p>
            <p className="mt-2 text-sm text-slate-400 transition-opacity duration-500">{message}</p>
        </div>
    );
};

const ImageGrid = ({ images }: { images: string[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 animate-fade-in">
        {images.map((img, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden ring-2 ring-slate-800 hover:ring-pink-500 transition-all duration-300 group">
                <img src={`data:image/png;base64,${img}`} alt={`Floor plan option ${index + 1}`} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <span className="text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity">Option {index + 1}</span>
                </div>
            </div>
        ))}
    </div>
);

// MAIN APP COMPONENT
export default function App() {
    const [units, setUnits] = useState<Units>('metric');
    const [requirements, setRequirements] = useState<FloorPlanRequirements>({
        plotSize: 250,
        bedrooms: 2,
        bathrooms: 2,
        livingRooms: 1,
        kitchens: 1,
        hasDining: true,
        hasBalcony: false,
        hasParking: true,
    });
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUnitToggle = (newUnit: Units) => {
        setUnits(newUnit);
        setRequirements(prev => {
            const isMetric = newUnit === 'metric';
            const conversionFactor = 10.764;
            const newSize = isMetric 
                ? Math.round(prev.plotSize / conversionFactor / 5) * 5 
                : Math.round(prev.plotSize * conversionFactor / 50) * 50;
            return { ...prev, plotSize: newSize || (isMetric ? 100 : 1000) };
        });
    }

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRequirements(prev => ({ ...prev, plotSize: parseInt(e.target.value, 10) }));
    };

    const handleRoomChange = (room: keyof FloorPlanRequirements, increment: boolean) => {
        setRequirements(prev => {
            const currentValue = prev[room] as number;
            const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
            return { ...prev, [room]: newValue };
        });
    };

    const handleFeatureToggle = (feature: keyof FloorPlanRequirements, value: boolean) => {
        setRequirements(prev => ({ ...prev, [feature]: value }));
    }

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        try {
            const images = await generateFloorPlans(requirements, units);
            setGeneratedImages(images);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [requirements, units]);

    const rooms: (keyof FloorPlanRequirements)[] = ['bedrooms', 'bathrooms', 'kitchens', 'livingRooms'];
    const features: (keyof FloorPlanRequirements)[] = ['hasDining', 'hasBalcony', 'hasParking'];
    const roomLabels: { [key in keyof FloorPlanRequirements]?: string } = {
        bedrooms: 'Bedroom', bathrooms: 'Bathroom', kitchens: 'Kitchen', livingRooms: 'Living Room'
    };
    const featureLabels: { [key in keyof FloorPlanRequirements]?: string } = {
        hasDining: 'Dining Area', hasBalcony: 'Balcony', hasParking: 'Car Parking'
    };

    return (
        <div className="flex h-screen bg-[#0B0F19] text-white font-sans">
            {/* Sidebar */}
            <aside className="w-[320px] bg-[#111827] flex flex-col border-r border-slate-700/50">
                <div className="p-6 border-b border-slate-700/50">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                        construction 3d
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto flex flex-col">
                    <div className="space-y-6">
                        <UnitsToggle value={units} onToggle={handleUnitToggle} />
                        
                        <div>
                            <div className="flex justify-between items-baseline">
                                <label htmlFor="total-area" className="text-sm font-medium text-slate-300">Total Area</label>
                                <span className="text-sm font-semibold">{requirements.plotSize} {units === 'metric' ? 'm²' : 'ft²'}</span>
                            </div>
                            <input
                                id="total-area"
                                type="range"
                                min={units === 'metric' ? 50 : 500}
                                max={units === 'metric' ? 500 : 5000}
                                step={units === 'metric' ? 5 : 50}
                                value={requirements.plotSize}
                                onChange={handleSliderChange}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-lg accent-pink-500 mt-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-slate-300">Rooms</h3>
                            <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg">
                                {rooms.map(room => (
                                    <RoomStepper
                                        key={room}
                                        label={roomLabels[room]!}
                                        value={requirements[room] as number}
                                        onIncrement={() => handleRoomChange(room, true)}
                                        onDecrement={() => handleRoomChange(room, false)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                             {features.map(feature => (
                                <FeatureToggle
                                    key={feature}
                                    label={featureLabels[feature]!}
                                    value={requirements[feature] as boolean}
                                    onToggle={(value) => handleFeatureToggle(feature, value)}
                                />
                             ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-6">
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:bg-pink-800/50 disabled:cursor-not-allowed transition-all">
                            {isLoading ? 'Generating...' : 'Generate Plans'}
                        </button>
                    </div>
                </form>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-slate-300">Results</h2>
                </div>
                <div className="flex-1 p-6 grid-background overflow-y-auto">
                    {isLoading && <Loader />}
                    {error && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center p-4 bg-red-900/20 border border-red-500/50 text-red-300 rounded-lg">
                                <p className="font-bold">An error occurred</p>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}
                    {!isLoading && !error && generatedImages.length === 0 && <EmptyState />}
                    {generatedImages.length > 0 && <ImageGrid images={generatedImages} />}
                </div>
            </main>
        </div>
    );
}
