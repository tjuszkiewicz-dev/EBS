import React, { useState } from 'react';
import { ServiceItem } from '../../../types';
import { Heart, Stethoscope, Brain, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';

interface LuxMedOfferSectionProps {
    services: ServiceItem[];
    onPurchase: (service: ServiceItem) => void;
}

type LuxMedTab = 'ALL' | 'BASIC' | 'COMFORT' | 'PREMIUM' | 'PSYCHO';

const PACKAGE_FEATURES: Record<string, string[]> = {
    'SRV-LUXMED-BASIC': [
        'Podstawowa opieka ambulatoryjna',
        'Internista i lekarz rodzinny',
        'Badania laboratoryjne (pakiet S)',
        'Teleporady 24/7',
    ],
    'SRV-LUXMED-COMFORT': [
        'Pełna opieka ambulatoryjna',
        'Specjaliści bez skierowania',
        'Badania laboratoryjne (pakiet M)',
        'Diagnostyka obrazowa (RTG, USG)',
        'Stomatologia profilaktyczna',
    ],
    'SRV-LUXMED-PREMIUM': [
        'Nieograniczony dostęp do specjalistów',
        'Hospitalizacja planowa',
        'Rehabilitacja i fizjoterapia',
        'Pełna diagnostyka (MRI, TK)',
        'Opieka stomatologiczna kompleksowa',
        'Opieka okulistyczna',
    ],
    'SRV-LUXMED-PSYCHO': [
        'Konsultacje psychologiczne (8/rok)',
        'Psychoterapia (sesje indywidualne)',
        'Program antystresowy online',
        'Wsparcie coacha wellbeing',
        'Infolinia zdrowia psychicznego 24/7',
    ],
};

const PACKAGE_ICONS: Record<string, React.ReactNode> = {
    'SRV-LUXMED-BASIC': <Stethoscope size={72} />,
    'SRV-LUXMED-COMFORT': <Heart size={72} />,
    'SRV-LUXMED-PREMIUM': <ShieldCheck size={72} />,
    'SRV-LUXMED-PSYCHO': <Brain size={72} />,
};

const PACKAGE_LABELS: Record<string, string> = {
    'SRV-LUXMED-BASIC': 'OPIEKA PODSTAWOWA',
    'SRV-LUXMED-COMFORT': 'OPIEKA ROZSZERZONA',
    'SRV-LUXMED-PREMIUM': 'OPIEKA PREMIUM',
    'SRV-LUXMED-PSYCHO': 'ZDROWIE PSYCHICZNE',
};

export const LuxMedOfferSection: React.FC<LuxMedOfferSectionProps> = ({ services, onPurchase }) => {
    const [activeTab, setActiveTab] = useState<LuxMedTab>('ALL');

    let luxmedServices = services.filter(s => s.id.startsWith('SRV-LUXMED'));
    if (luxmedServices.length === 0) {
        luxmedServices = [
            { id: 'SRV-LUXMED-BASIC',   name: 'LUX MED Opieka S',       description: 'Podstawowy pakiet opieki medycznej dla pracownika – dostęp do lekarzy pierwszego kontaktu i teleporad.',  price: 89,  type: 'SUBSCRIPTION' as any, icon: 'Stethoscope' as any, isActive: true },
            { id: 'SRV-LUXMED-COMFORT', name: 'LUX MED Opieka M',       description: 'Rozszerzony pakiet ze specjalistami bez skierowania, diagnostyką i stomatologią profilaktyczną.',         price: 149, type: 'SUBSCRIPTION' as any, icon: 'Heart' as any,        isActive: true },
            { id: 'SRV-LUXMED-PREMIUM', name: 'LUX MED Opieka L',       description: 'Kompleksowa opieka premium – hospitalizacja, rehabilitacja, pełna diagnostyka i stomatologia.',           price: 249, type: 'SUBSCRIPTION' as any, icon: 'ShieldCheck' as any,  isActive: true },
            { id: 'SRV-LUXMED-PSYCHO',  name: 'LUX MED Zdrowie Psychiczne', description: 'Pakiet wsparcia psychologicznego i wellbeing dla pracowników – terapia, coaching, infolinia 24/7.', price: 99,  type: 'SUBSCRIPTION' as any, icon: 'Brain' as any,        isActive: true },
        ];
    }

    const filteredServices = luxmedServices.filter(s => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'BASIC'   && s.id === 'SRV-LUXMED-BASIC')   return true;
        if (activeTab === 'COMFORT' && s.id === 'SRV-LUXMED-COMFORT') return true;
        if (activeTab === 'PREMIUM' && s.id === 'SRV-LUXMED-PREMIUM') return true;
        if (activeTab === 'PSYCHO'  && s.id === 'SRV-LUXMED-PSYCHO')  return true;
        return false;
    });

    return (
        <div className="rounded-2xl shadow-sm border border-slate-200 mb-8 font-sans overflow-hidden">

            {/* HEADER */}
            <div className="bg-white p-8 relative overflow-hidden border-b border-slate-100">
                <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-blue-50 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
                    <div className="flex items-center gap-5">
                        {/* LuxMed logo */}
                        <img
                            src="/lux.png"
                            alt="Grupa LUX MED"
                            className="h-14 object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Partner zdrowotny platformy BBS</p>
                            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                                Pakiety Medyczne <span className="text-blue-700">Grupy LUX MED</span>
                            </h2>
                            <p className="text-sm text-slate-500 mt-1 max-w-lg">
                                Zadbaj o zdrowie swoje i bliskich. Opłać pakiet medyczny voucherami pracowniczymi.{' '}
                                <span className="text-blue-700 font-semibold">Aktywacja w 24h.</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span className="bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Jesteśmy częścią Bupa</span>
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Benefit pracowniczy</span>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="bg-slate-50/50 p-8">
                {/* Tabs */}
                <div className="flex gap-6 mb-8 overflow-x-auto pb-2 border-b border-slate-200">
                    {[
                        { id: 'ALL',     label: 'Wszystkie pakiety' },
                        { id: 'BASIC',   label: 'Opieka S' },
                        { id: 'COMFORT', label: 'Opieka M' },
                        { id: 'PREMIUM', label: 'Opieka L' },
                        { id: 'PSYCHO',  label: 'Zdrowie Psychiczne' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as LuxMedTab)}
                            className={`pb-4 text-sm font-bold transition-all whitespace-nowrap relative ${
                                activeTab === tab.id
                                    ? 'text-blue-700'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {tab.label.toUpperCase()}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-700 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {filteredServices.map(service => {
                        const features = PACKAGE_FEATURES[service.id] ?? [];
                        const icon = PACKAGE_ICONS[service.id] ?? <Heart size={72} />;
                        const label = PACKAGE_LABELS[service.id] ?? 'PAKIET MEDYCZNY';
                        const isPremium = service.id === 'SRV-LUXMED-PREMIUM';

                        return (
                            <div
                                key={service.id}
                                className={`group relative flex flex-col bg-white rounded-2xl border transition-all duration-500 hover:-translate-y-2 overflow-hidden ${
                                    isPremium
                                        ? 'border-blue-300 shadow-lg shadow-blue-100'
                                        : 'border-slate-200 shadow-sm hover:shadow-[0_20px_50px_-12px_rgba(37,99,235,0.2)] hover:border-blue-300'
                                }`}
                            >
                                {isPremium && (
                                    <div className="absolute top-3 right-3 bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider z-10">
                                        Najpopularniejszy
                                    </div>
                                )}

                                {/* Top accent line */}
                                <div className={`h-1 w-full bg-gradient-to-r from-blue-500 to-blue-700 transform origin-left transition-transform duration-500 ${isPremium ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />

                                <div className="p-6 flex-1 flex flex-col">
                                    {/* Background icon */}
                                    <div className="absolute top-4 right-4 text-slate-100 transform scale-100 origin-top-right transition-all group-hover:text-blue-50 group-hover:scale-110 duration-700 pointer-events-none">
                                        {icon}
                                    </div>

                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block group-hover:text-blue-600 transition-colors duration-300">
                                        {label}
                                    </span>
                                    <h3 className="text-xl font-extrabold text-slate-900 mb-1 leading-tight z-10 relative">
                                        {service.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-5 leading-relaxed border-l-2 border-slate-100 group-hover:border-blue-400 pl-3 transition-colors duration-300 z-10 relative">
                                        {service.description}
                                    </p>

                                    {/* Features list */}
                                    <ul className="space-y-2 mb-6 flex-1 z-10 relative">
                                        {features.map((f, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <CheckCircle size={15} className="text-blue-600 mt-0.5 shrink-0" />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Price + CTA */}
                                    <div className="mt-auto pt-4 border-t border-slate-100 z-10 relative">
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-3xl font-extrabold text-slate-900 tracking-tighter">{service.price}</span>
                                            <span className="text-base font-bold text-blue-700">pkt</span>
                                            <span className="text-xs text-slate-400 ml-1 font-medium">/ miesiąc</span>
                                        </div>
                                        <button
                                            onClick={() => onPurchase(service)}
                                            className={`w-full font-bold py-3 px-5 rounded-xl transition-all duration-300 flex items-center justify-between group/btn text-sm ${
                                                isPremium
                                                    ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-lg shadow-blue-700/25'
                                                    : 'bg-slate-900 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            <span className="uppercase tracking-wide font-extrabold">Wybieram pakiet</span>
                                            <ArrowRight size={18} className="transform group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer info */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-wrap items-center gap-3 text-xs text-blue-800">
                    <ShieldCheck size={16} className="text-blue-600 shrink-0" />
                    <span>
                        <strong>Jak to działa?</strong> Wybierz pakiet i potwierdź zakup voucherami. Nasz dział HR aktywuje pakiet w ciągu 24h.
                        Otrzymasz e-mail z kartą pacjenta i dostępem do portalu LUX MED.
                    </span>
                    <a
                        href="https://www.luxmed.pl/dla-firm"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto font-bold text-blue-700 hover:underline whitespace-nowrap"
                    >
                        Więcej o Grupie LUX MED →
                    </a>
                </div>
            </div>
        </div>
    );
};
