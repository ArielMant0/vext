export default {
    title: 'VEXT Docs',
    description: 'Just playing around.',
    themeConfig: {
        sidebar: [
            {
                text: 'Components',
                items: [
                    { text: 'NoteCanvas', link: 'src/components/NoteCanvas' },
                    { text: 'NoteConfiguration', link: 'src/components/NoteConfiguration' },
                    { text: 'HistoryControls', link: 'src/components/HistoryControls' },
                    { text: 'HistoryDrawer', link: 'src/components/HistoryDrawer' },
                    { text: 'ToolTip', link: 'src/components/ToolTip' },
                ]
              },{
                text: 'Tools',
                items: [
                    { text: 'LayersTool', link: 'src/components/tools/LayersTool' },
                    { text: 'BrushTool', link: 'src/components/tools/BrushTool' },
                    { text: 'ShapeTool', link: 'src/components/tools/ShapeTool' },
                    { text: 'EditTool', link: 'src/components/tools/EditTool' },
                    { text: 'ColorViewer', link: 'src/components/tools/ColorViewer' },
                ]
              },{
                text: 'Stores',
                items: [
                    { text: 'Note Store', link: 'stores/note' },
                    { text: 'State Store', link: 'stores/state' },
                    { text: 'History Store', link: 'stores/history' },
                ]
              }
        ]
    }
}