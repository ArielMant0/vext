export default {
    base: '/vext/',
    title: 'VEXT API',
    description: 'API documentation for the VEXT library for visualization externalization',
    appearance: 'dark',
    lastUpdated: true,
    themeConfig: {
        repo: "https://github.com/ArielMant0/vext",
        nav: [
            { text: 'Home', link: '/#vext' },
            { text: 'Guide', link: '/#usage' },
            { text: "GitHub", link: "https://github.com/ArielMant0/vext" },
            { text: "npm", link: "https://www.npmjs.com/package/@nullbuild/vext" },
        ],
        sidebar: [
            {
                text: 'Components',
                items: [
                    { text: 'VextNoteCanvas', link: 'src/components/VextNoteCanvas' },
                    { text: 'VextNoteConfiguration', link: 'src/components/VextNoteConfiguration' },
                    { text: 'VextNoteDrawer', link: 'src/components/VextNoteDrawer' },
                    { text: 'VextHistoryDrawer', link: 'src/components/VextHistoryDrawer' },
                    { text: 'VextWhiteBoard', link: 'src/components/VextWhiteBoard' },
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
                    { text: 'VextSettingsTool', link: 'src/components/tools/VextSettingsTool' },
                    { text: 'VextWhiteBoardTool', link: 'src/components/tools/VextWhiteBoardTool' },
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
                    { text: 'VextWhiteBoard Store', link: 'stores/whiteboard' },
                ]
              }
        ]
    }
}