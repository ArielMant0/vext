export default {
    base: '/vext/',
    title: 'VEXT Docs',
    description: 'Documentation for the VEXT library for visualization externalization',
    appearance: 'dark',
    lastUpdated: true,
    themeConfig: {
        sidebar: [
            {
                text: 'Components',
                items: [
                    { text: 'VextNoteCanvas', link: 'src/components/VextNoteCanvas' },
                    { text: 'VextNoteConfiguration', link: 'src/components/VextNoteConfiguration' },
                    { text: 'VextNoteDrawer', link: 'src/components/VextNoteDrawer' },
                    { text: 'VextHistoryControls', link: 'src/components/VextHistoryControls' },
                    { text: 'VextHistoryDrawer', link: 'src/components/VextHistoryDrawer' },
                    { text: 'VextToolTip', link: 'src/components/VextToolTip' },
                ]
              },{
                text: 'Tools',
                items: [
                    { text: 'VextLayersTool', link: 'src/components/tools/VextLayersTool' },
                    { text: 'VextBrushTool', link: 'src/components/tools/VextBrushTool' },
                    { text: 'VextShapeTool', link: 'src/components/tools/VextShapeTool' },
                    { text: 'VextEditTool', link: 'src/components/tools/VextEditTool' },
                    { text: 'VextColorViewer', link: 'src/components/tools/VextColorViewer' },
                ]
              },{
                text: 'Stores',
                items: [
                    { text: 'VextNote Store', link: 'stores/note' },
                    { text: 'VextState Store', link: 'stores/state' },
                    { text: 'VextHistory Store', link: 'stores/history' },
                    { text: 'VextApp Store', link: 'stores/app' },
                ]
              }
        ]
    }
}