import re

files_to_fix = [
    {
        'path': 'frontend/src/components/user/UserTicketsTable.jsx',
        'import': 'import { StatusBadge } from "../shared/Badges";'
    },
    {
        'path': 'frontend/src/components/user/UserTicketDetail.jsx',
        'import': 'import { StatusBadge, PriorityBadge } from "../shared/Badges";'
    },
    {
        'path': 'frontend/src/components/admin/ReportsSection.jsx',
        'import': 'import { StatusBadge, PriorityBadge } from "../shared/Badges";'
    },
    {
        'path': 'frontend/src/components/admin/AreaManagementSection.jsx',
        'import': 'import { StatusBadge, PriorityBadge } from "../shared/Badges";'
    }
]

for f in files_to_fix:
    try:
        content = open(f['path'], 'r', encoding='utf-8').read()
        
        # Inject import
        if 'Badges' not in content:
            if 'import { getFileUrl' in content:
                content = content.replace('import { getFileUrl } from "../../lib/api";', 'import { getFileUrl } from "../../lib/api";\n' + f['import'])
            else:
                lines = content.split('\n')
                # Find last import
                last_import = 0
                for i, line in enumerate(lines):
                    if line.startswith('import '):
                        last_import = i
                lines.insert(last_import + 1, f['import'])
                content = '\n'.join(lines)
        
        # Replace Stack states
        content = re.sub(r'<Stack direction="row" spacing=\{0\.8\}.*?</Stack>', '<StatusBadge status={r.estado} />', content, flags=re.DOTALL)
        content = re.sub(r'<Stack direction={{ xs: "column", sm: "row" }} spacing=\{1\} sx={{ mt: { xs: 2, sm: 0 } }}>.*?</Stack>', 
                         '<Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: { xs: 2, sm: 0 } }}>\n'
                         '  <Box sx={{ bgcolor: "#f3f4f6", px: 1.5, py: 0.5, borderRadius: 2 }}><StatusBadge status={ticket.estado} /></Box>\n'
                         '  <Box sx={{ bgcolor: "#f3f4f6", px: 1.5, py: 0.5, borderRadius: 2, display: { xs: "none", sm: "block" } }}><PriorityBadge priority={ticket.prioridad} /></Box>\n'
                         '</Stack>', content, flags=re.DOTALL)
                         
        # Replace Chips for priority
        content = re.sub(r'<Chip size="small" label=\{r\.prioridad\} sx={{ fontWeight: 600 }} />', '<PriorityBadge priority={r.prioridad} />', content)
        content = re.sub(r'<Chip size="small" label=\{r\.estado\}.*?/>', '<StatusBadge status={r.estado} />', content)
        
        # Replace chips in UserTicketDetail
        content = re.sub(r'<Chip label=\{ticket\.estado\}.*?/>', '<Box sx={{ bgcolor: "#f3f4f6", px: 1.5, py: 0.5, borderRadius: 2 }}><StatusBadge status={ticket.estado} /></Box>', content)
        content = re.sub(r'<Chip label=\{ticket\.prioridad\}.*?/>', '<Box sx={{ bgcolor: "#f3f4f6", px: 1.5, py: 0.5, borderRadius: 2, display: { xs: "none", sm: "block" } }}><PriorityBadge priority={ticket.prioridad} /></Box>', content)
        
        open(f['path'], 'w', encoding='utf-8', newline='\n').write(content)
        print(f"Processed {f['path']}")
    except Exception as e:
        print(f"Error on {f['path']}: {e}")
