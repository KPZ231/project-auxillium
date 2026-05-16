"use client";

import React, { useState } from 'react';
import { BrandingSettings } from '@/types/templates';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { SortableBlock } from './SortableBlock';
import { BlockSidebar } from './BlockSidebar';

export interface DocumentBlock {
  id: string;
  type: 'text' | 'heading' | 'table' | 'image' | 'divider' | 'variable' | 'signature' | 'page-break';
  content: Record<string, string | number | boolean | undefined>;
}

interface BlockEditorProps {
  blocks: DocumentBlock[];
  onChange: (blocks: DocumentBlock[]) => void;
  branding: BrandingSettings;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ 
  blocks, 
  onChange, 
  branding,
  selectedBlockId,
  onSelectBlock
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const addBlock = (type: DocumentBlock['type']) => {
    const newBlock: DocumentBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'heading' ? { text: 'Nagłówek', level: 2 } : { text: '' }
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: DocumentBlock['content']) => {
    onChange(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const activeBlock = activeId ? blocks.find(b => b.id === activeId) : null;

  return (
    <div className="flex-1 flex overflow-hidden">
      <BlockSidebar onAdd={addBlock} />
      
      <div className="flex-1 bg-[#F4F4F5] p-8 overflow-y-auto flex justify-center">
        <div 
          className="bg-white min-h-[297mm] w-[210mm] shadow-none border border-[#E5E5E5] p-[20mm] transition-all"
          style={{ fontFamily: branding.fontFamily }}
        >
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          >
            <SortableContext 
              items={blocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {blocks.map((block) => (
                  <SortableBlock 
                    key={block.id} 
                    block={block} 
                    isSelected={selectedBlockId === block.id}
                    onSelect={() => onSelectBlock(block.id)}
                    onUpdate={(content) => updateBlock(block.id, content)}
                    onDelete={() => deleteBlock(block.id)}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: '0.5',
                  },
                },
              }),
            }}>
              {activeId && activeBlock ? (
                <div className="bg-white border border-[#0A0A0A] p-4 opacity-80 shadow-xl cursor-grabbing">
                   <p className="text-xs font-bold uppercase tracking-widest">{activeBlock.type}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          
          {blocks.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E5E5] text-[#A1A1AA]">
              <p>Kliknij bloki w panelu bocznym, aby zacząć budować dokument.</p>
              <p className="text-[10px] mt-2 font-bold uppercase tracking-widest">Wkrótce: Przeciąganie bezpośrednio z panelu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
