"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

const ARRAY_SIZE = 16;
const BUBBLE_SPEED_MS = 250;
const INITIAL_ARRAY = [40, 75, 25, 90, 50, 20, 80, 60, 30, 85, 45, 95, 35, 70, 55, 65];

export function AlgorithmVisualizer() {
  const [array, setArray] = useState<number[]>(INITIAL_ARRAY);
  const [isRunning, setIsRunning] = useState(false);
  
  // Bubble Sort state
  const [comparing, setComparing] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  const resetState = () => {
    setComparing([]);
    setSortedIndices([]);
    setIsRunning(false);
  };

  const generateArray = useCallback(() => {
    clearTimeouts();
    resetState();
    
    let newArray = [];
    for (let i = 0; i < ARRAY_SIZE; i++) {
      newArray.push(Math.floor(Math.random() * 80) + 20); // 20 to 100
    }
    
    setArray(newArray);
    return newArray;
  }, []);

  const runBubbleSort = (arrToSort: number[]) => {
    let arr = [...arrToSort];
    let animations = [];
    
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        animations.push({ type: "compare", indices: [j, j + 1] });
        if (arr[j] > arr[j + 1]) {
          animations.push({ type: "swap", indices: [j, j + 1], array: [...arr] });
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          animations.push({ type: "update", array: [...arr] });
        }
      }
      animations.push({ type: "sorted", index: arr.length - i - 1 });
    }
    animations.push({ type: "sorted", index: 0 });

    animations.forEach((anim, i) => {
      const timeout = setTimeout(() => {
        if (anim.type === "compare") {
          setComparing(anim.indices as number[]);
        } else if (anim.type === "update") {
          setArray(anim.array as number[]);
        } else if (anim.type === "sorted") {
          setSortedIndices(prev => [...prev, anim.index as number]);
          setComparing([]);
        }
        
        if (i === animations.length - 1) {
          finishAnimation();
        }
      }, i * BUBBLE_SPEED_MS);
      timeouts.current.push(timeout);
    });
  };

  const finishAnimation = () => {
    setIsRunning(false);
    setComparing([]);
    
    // Auto-restart after 4s
    const restartTimeout = setTimeout(() => {
      const nextArr = generateArray();
      
      const startTimeout = setTimeout(() => {
        runAlgorithm(nextArr);
      }, 500);
      timeouts.current.push(startTimeout);
    }, 4000);
    timeouts.current.push(restartTimeout);
  };

  const runAlgorithm = useCallback((arrOverride?: number[]) => {
    if (isRunning) return;
    setIsRunning(true);
    runBubbleSort(arrOverride || array);
  }, [array, isRunning]);

  const handleRunClick = () => {
    if (isRunning) return;
    runAlgorithm(array);
  };

  const handleShuffleClick = () => {
    if (isRunning) return;
    generateArray();
  };

  // Initial Auto-start
  useEffect(() => {
    runAlgorithm(INITIAL_ARRAY);
    return () => clearTimeouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-[480px] bg-surface-primary border-4 border-text-primary dark:border-border-default rounded-xl shadow-[8px_8px_0px_var(--text-primary)] dark:shadow-[8px_8px_0px_var(--border-hover)] hover:shadow-[8px_8px_0px_var(--accent-primary)] dark:hover:shadow-[8px_8px_0px_var(--accent-primary)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="flex justify-between items-center py-3 px-4 bg-surface-secondary border-b-4 border-text-primary dark:border-border-default">
        <div className="flex items-center gap-3">
          <h3 className="m-0 font-black text-xl uppercase tracking-tight text-text-primary">Bubble Sort</h3>
          <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs font-bold bg-text-primary text-surface-primary py-1 px-2 rounded-sm">O(N²)</span>
        </div>
        <div className="flex gap-2">
          <button 
            className="flex items-center justify-center w-9 h-9 bg-surface-primary border-2 border-text-primary dark:border-border-default rounded-md cursor-pointer text-text-primary transition-all duration-150 hover:not-disabled:bg-surface-secondary hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[2px_2px_0px_var(--text-primary)] dark:hover:not-disabled:shadow-[2px_2px_0px_var(--border-default)] active:not-disabled:translate-y-0 active:not-disabled:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleShuffleClick} 
            disabled={isRunning}
            title="Shuffle Array"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
          </button>
          <button 
            className="flex items-center justify-center w-9 h-9 bg-accent-primary text-accent-primary-text border-2 border-text-primary dark:border-border-default rounded-md cursor-pointer transition-all duration-150 hover:not-disabled:bg-accent-primary-hover hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[2px_2px_0px_var(--text-primary)] dark:hover:not-disabled:shadow-[2px_2px_0px_var(--border-default)] active:not-disabled:translate-y-0 active:not-disabled:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRunClick} 
            disabled={isRunning}
            title="Run Sort"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="h-[240px] flex items-end p-4 gap-1 [background-image:linear-gradient(to_right,var(--grid-lines)_1px,transparent_1px),linear-gradient(to_top,var(--grid-lines)_1px,transparent_1px)] [background-size:20px_20px]">
        {array.map((value, idx) => {
          const isComparing = comparing.includes(idx);
          const isSorted = sortedIndices.includes(idx);
          
          return (
            <div 
              key={idx} 
              className={`flex-1 border-2 border-b-0 rounded-t flex justify-center items-start pt-1 transition-all duration-200 relative overflow-hidden ${
                isComparing
                  ? "bg-accent-primary border-text-primary dark:border-accent-primary"
                  : isSorted
                  ? "bg-text-primary border-text-primary"
                  : "bg-text-primary border-text-primary"
              }`}
              style={{ height: `${value}%` }}
            >
              <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-[10px] font-bold text-surface-primary [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180 pointer-events-none">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
