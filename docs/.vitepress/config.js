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
                    { text: 'VextAlertBox', link: 'src/components/VextAlertBox' },
                    { text: 'VextAppBarControls', link: 'src/components/VextAppBarControls' },
                    { text: 'VextPointerMenu', link: 'src/components/VextPointerMenu' },
                    { text: 'VextCircleMenu', link: 'src/components/VextCircleMenu' },
                    { text: 'VextCircleSettingsMenu', link: 'src/components/VextCircleSettingsMenu' },
                    { text: 'VextToolTip', link: 'src/components/VextToolTip' },
                    { text: 'VextGlobalToolTip', link: 'src/components/VextGlobalToolTip' },
                ]
              },{
                text: 'Tools',
                items: [
                    { text: 'VextLayersTool', link: 'src/components/tools/VextLayersTool' },
                    { text: 'VextBrushTool', link: 'src/components/tools/VextBrushTool' },
                    { text: 'VextShapeTool', link: 'src/components/tools/VextShapeTool' },
                    { text: 'VextEditTool', link: 'src/components/tools/VextEditTool' },
                    { text: 'VextConnectTool', link: 'src/components/tools/VextConnectTool' },
                    { text: 'VextColorViewer', link: 'src/components/tools/VextColorViewer' },
                    { text: 'VextLayerInfo', link: 'src/components/tools/VextLayerInfo' },
                ]
              },{
                text: 'Stores',
                items: [
                    { text: 'VextNote Store', link: 'stores/note' },
                    { text: 'VextSettings Store', link: 'stores/settings' },
                    { text: 'VextState Store', link: 'stores/state' },
                    { text: 'VextHistory Store', link: 'stores/history' },
                    { text: 'VextApp Store', link: 'stores/app' },
                    { text: 'VextInput Store', link: 'stores/input' },
                ]
              }
        ]
    }
}