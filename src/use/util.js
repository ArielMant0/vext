import * as d3 from 'd3';
import { fabric } from 'fabric';

function parseAccessor(item) {
    switch (typeof item) {
        case 'string':
            return d => d[item]
        case 'number':
            return _ => item
        default:
            return item;
    }
}

function listx(d) { return d[0] }
function listy(d) { return d[1] }

function objx(d) { return d.x }
function objy(d) { return d.y }

function pointsInPolygons(polygons, data, xScale, yScale, x=objx, y=objy) {
    x = parseAccessor(x);
    y = parseAccessor(y);
    return data.filter(d => {
        return d.value > 0 && polygons.some(p => {
            return d3.polygonContains(p, [xScale(x(d)), yScale(y(d))])
        })
    });
}

function rectsInPolygons(polygons, data, xScale, yScale, x0=objx, y0=objy, x1=objx, y1=objy) {
    x0 = parseAccessor(x0);
    y0 = parseAccessor(y0);
    x1 = parseAccessor(x1);
    y1 = parseAccessor(y1);
    return data.filter(d => {
        return d.value > 0 && polygons.some(p => {
            return d3.polygonContains(p, [xScale(x0(d)), yScale(y0(d))]) &&
                d3.polygonContains(p, [xScale(x1(d)), yScale(y1(d))])
        })
    });
}

function circlesInPolygons(polygons, data, xScale, yScale, radius, x=objx, y=objy) {
    x = parseAccessor(x);
    y = parseAccessor(y);
    return data.filter(d => {
        return d.value > 0 && polygons.some(p => {
            return d3.polygonContains(p, [xScale(x(d)-radius), yScale(y(d))]) &&
                d3.polygonContains(p, [xScale(x(d)+radius), yScale(y(d))]) &&
                d3.polygonContains(p, [xScale(x(d)), yScale(y(d)-radius)]) &&
                d3.polygonContains(p, [xScale(x(d)), yScale(y(d)+radius)])
        })
    });
}

function createFabricObject(type, options) {
    switch(type) {
        case "circle":
            return new fabric.Circle(options);
        case "rect":
            return new fabric.Rect(options);
        case "triangle":
            return new fabric.Triangle(options);
        case "text":
            return new fabric.Text(options);
        case "path":
            return new fabric.Path(options.path, options);
    }
}

export { pointsInPolygons, rectsInPolygons, circlesInPolygons, createFabricObject };