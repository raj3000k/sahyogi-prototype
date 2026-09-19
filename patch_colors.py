import re

with open('app/globals.css', 'r') as f:
    css = f.read()

replacements = {
    # Brand mark
    r'(\.brand-mark \{.*?background:\s*)#[0-9a-fA-F]+(;.*?color:\s*)#[0-9a-fA-F]+': r'\1#00baf2\2#ffffff',
    
    # Buttons
    r'(\.new-button,\s*\.primary \{.*?background:\s*)#[0-9a-fA-F]+': r'\1#002970',
    r'(\.ask button \{.*?background:\s*)#[0-9a-fA-F]+': r'\1#00baf2',
    
    # Hero section
    r'(\.hero \{.*?background:\s*)#[0-9a-fA-F]+': r'\1#e6f7ff',
    r'(\.pill \{.*?background:\s*)#[0-9a-fA-F]+(;.*?color:\s*)#[0-9a-fA-F]+': r'\1#cceeff\2#005580',
    r'(\.hero h2 em \{.*?color:\s*)#[0-9a-fA-F]+': r'\1#00baf2',
    r'(\.spark \{.*?color:\s*)#[0-9a-fA-F]+': r'\1#00baf2',
    
    # Orbs
    r'(\.glow-one \{.*?background:\s*)#[0-9a-fA-F]+': r'\1#cceeff',
    r'(\.orb-core \{.*?background:\s*)#[0-9a-fA-F]+(;.*?color:\s*)#[0-9a-fA-F]+': r'\1#002970\2#e6f7ff',
    
    # Live dot & tasks
    r'(\.live-dot \{.*?background:\s*)#[0-9a-fA-F]+(;.*?box-shadow:\s*0 0 0 3px\s*)#[0-9a-fA-F]+': r'\1#00baf2\2#cceeff',
    r'(\.live-task span \{.*?color:\s*)#[0-9a-fA-F]+': r'\1#0077b3',
    r'(@keyframes live-pulse \{ 0%,100% \{ box-shadow: 0 0 0 3px\s*)#[0-9a-fA-F]+(; \} 50% \{ box-shadow: 0 0 0 6px\s*)#[0-9a-fA-F]+77': r'\1#cceeff\2#cceeff',
    
    # Cards & KYA
    r'(\.kya b,\s*\.team-card > span \{.*?color:\s*)#[0-9a-fA-F]+': r'\1#002970',
    r'(\.vertical-card:hover,\s*\.team-card:hover \{.*?border-color:\s*)#[0-9a-fA-F]+': r'\1#00baf2',
    r'(\.vertical-card em \{.*?color:\s*)#[0-9a-fA-F]+': r'\1#00baf2',
    r'(\.vertical-card strong \{.*?color:\s*)#[0-9a-fA-F]+': r'\1#002970',
    
    # Agent Tools and loader
    r'(\.agent-tools span \{.*?color:\s*)#[0-9a-fA-F]+(;.*?background:\s*)#[0-9a-fA-F]+': r'\1#005580\2#e6f7ff',
    r'(\.agent-status \{.*?color:\s*)#[0-9a-fA-F]+': r'\1#00baf2',
    r'(\.agent-loader b \{.*?background:\s*)#[0-9a-fA-F]+': r'\1#00baf2',
    r'(\.kya \{.*?border:\s*1px solid\s*)#[0-9a-fA-F]+(;.*?background:\s*)#[0-9a-fA-F]+': r'\1#cceeff\2#f0faff',
    r'(\.kya span \{.*?color:\s*)#[0-9a-fA-F]+': r'\1#005580',
    
    # Context Meter
    r'(\.context-meter i \{.*?background:\s*)#[0-9a-fA-F]+': r'\1#00baf2',
}

for pattern, repl in replacements.items():
    css = re.sub(pattern, repl, css, flags=re.DOTALL)

with open('app/globals.css', 'w') as f:
    f.write(css)
