import React, { useState } from 'react';
import Typography from '../Foundation/Typography';
import Icon from '../Foundation/Icon';

export function AccordionItem({ 
  id, 
  title, 
  isOpen, 
  onToggle, 
  children 
}) {
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-all text-left group"
      >
        <Typography variant="h6" className="font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
          {title}
        </Typography>
        <div className={`text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <Icon name="expand_more" />
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Accordion({ 
  items = [], 
  allowMultiple = false, 
  className = "" 
}) {
  const [openIds, setOpenIds] = useState([]);

  const handleToggle = (id) => {
    if (allowMultiple) {
      setOpenIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setOpenIds(prev => prev.includes(id) ? [] : [id]);
    }
  };

  return (
    <div className={`border border-border rounded-lg bg-card/30 overflow-hidden ${className}`}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          title={item.title}
          isOpen={openIds.includes(item.id)}
          onToggle={handleToggle}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}
