<template>
    <svg ref="el" :width="width" :height="height"></svg>
</template>

<script setup>

    import * as d3 from 'd3';
    import { useVextNote } from '@/store/note';
    import { ref, computed, watch, onMounted } from 'vue';

    const props = defineProps({
        rows: {
            type: Number,
            default: 5
        },
        width: {
            type: Number,
            default: 400
        },
        rowHeight: {
            type: Number,
            default: 100
        },
    })
    const height = computed(() => props.rowHeight*props.rows)

    const bins = 15;
    const el = ref(null);
    const note = useVextNote();

    function draw() {

        const svg = d3.select(el.value);
        svg.selectAll("*").remove();

        const data = [];

        const x = d3.scaleBand()
            .domain(d3.range(bins))
            .range([5, props.width-5])
            .padding(0.05)

        const y = d3.scaleLinear()
            .domain([0, 1])
            .range([props.rowHeight-5, 5])

        for (let i = 0; i < props.rows; ++i) {
            const array = [];
            for (let j = 0; j < bins; ++j) {
                array.push({ x: j, y: Math.random() })
            }
            data.push(array);
        }

        svg.append("g")
            .selectAll("g")
            .data(data)
            .join("g")
            .attr("transform", (_, i) => `translate(0,${i*props.rowHeight})`)
            .selectAll("rect")
            .data(d => d)
            .join("rect")
                .attr("x", d => x(d.x))
                .attr("y", d => y(d.y))
                .attr("width", x.bandwidth())
                .attr("height", d => y(0)-y(d.y))
                .attr("fill", "steelblue")
                .on("click", function(event, d) {
                    note.startConnect(d, event.pageX, event.pageY);
                })
    }

    onMounted(draw);

    watch(props, draw);

</script>