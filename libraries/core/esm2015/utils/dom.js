const $RAF = window.requestAnimationFrame;
const $RAFQueue = [];
const invokeLater = fn => {
    if (!$RAFQueue.length) {
        $RAF(() => {
            $RAFQueue.forEach(f => f());
            $RAFQueue.length = 0;
        });
    }
    $RAFQueue.push(fn);
};
const ɵ0 = invokeLater;
export const appendNode = (node, parent, sync) => {
    const task = () => parent.appendChild(node);
    sync ? task() : invokeLater(task);
};
export const insertBefore = (node, ref, sync) => {
    const task = () => ref.parentNode.insertBefore(node, ref);
    sync ? task() : invokeLater(task);
};
export const insertAfter = (node, ref, sync) => {
    const task = () => ref.parentNode.insertBefore(node, ref.nextSibling);
    sync ? task() : invokeLater(task);
};
export const removeNode = (node, sync) => {
    const task = () => node.remove();
    sync ? task() : invokeLater(task);
};
export const removeClass = (node, ov, sync) => {
    ov = ov || '';
    const task = c => node.classList.remove(c);
    ov.split(' ').forEach(c => {
        if (c.length) {
            sync ? task(c) : invokeLater(() => task(c));
        }
    });
};
export const addClass = (node, nv, sync) => {
    nv = nv || '';
    const task = c => node.classList.add(c);
    nv.split(' ').forEach(c => {
        if (c.length) {
            sync ? task(c) : invokeLater(() => task(c));
        }
    });
};
export const switchClass = (node, toAdd = '', toRemove = '', sync) => {
    removeClass(node, toRemove, sync);
    addClass(node, toAdd, sync);
};
export const toggleClass = (node, cls, condition, sync) => {
    if (condition) {
        addClass(node, cls, sync);
    }
    else {
        removeClass(node, cls, sync);
    }
};
export const setCSS = (node, cssName, val, sync) => {
    const task = () => node.style[cssName] = val;
    sync ? task() : invokeLater(task);
};
export const setCSSFromObj = (node, cssObj, sync) => {
    const keys = Object.keys(cssObj || {});
    keys.forEach(key => setCSS(node, key, cssObj[key], sync));
};
export const setProperty = (node, propName, val, sync) => {
    const task = () => node[propName] = val;
    sync ? task() : invokeLater(task);
};
export const setAttr = (node, attrName, val, sync) => {
    const task = () => node instanceof Element && node.setAttribute(attrName, val);
    sync ? task() : invokeLater(task);
};
export const setHtml = (node, html, sync) => {
    const task = () => node.innerHTML = html;
    sync ? task() : invokeLater(task);
};
export const removeAttr = (node, attrName, sync) => {
    const task = () => node.removeAttribute(attrName);
    sync ? task() : invokeLater(task);
};
export const createElement = (nodeType, attrs, sync) => {
    const node = document.createElement(nodeType);
    if (attrs) {
        Object.keys(attrs).forEach(attrName => {
            setAttr(node, attrName, attrs[attrName], sync);
        });
    }
    return node;
};
// for width and height if a numeric value is specified return in px
// else return the same value
export const toDimension = (v) => {
    // @ts-ignore
    if (v == +v) {
        return `${v}px`;
    }
    return v;
};
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvcmUvIiwic291cmNlcyI6WyJ1dGlscy9kb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDO0FBQzFDLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUVyQixNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsRUFBRTtJQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtRQUNuQixJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ04sU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDNUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7S0FDTjtJQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdkIsQ0FBQyxDQUFDOztBQUVGLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxDQUFDLElBQWlCLEVBQUUsTUFBbUIsRUFBRSxJQUFjLEVBQUUsRUFBRTtJQUNqRixNQUFNLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QyxDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUFpQixFQUFFLEdBQWdCLEVBQUUsSUFBYyxFQUFFLEVBQUU7SUFDaEYsTUFBTSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzFELElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENB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LE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQztLQUNOO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQyxDQUFDO0FBRUYsb0VBQW9FO0FBQ3BFLDZCQUE2QjtBQUM3QixNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFrQixFQUFFLEVBQUU7SUFDOUMsYUFBYTtJQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ1QsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDO0tBQ25CO0lBQ0QsT0FBTyxDQUFDLENBQUM7QUFDYixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCAkUkFGID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcbmNvbnN0ICRSQUZRdWV1ZSA9IFtdO1xuXG5jb25zdCBpbnZva2VMYXRlciA9IGZuID0+IHtcbiAgICBpZiAoISRSQUZRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgJFJBRigoKSA9PiB7XG4gICAgICAgICAgICAkUkFGUXVldWUuZm9yRWFjaChmID0+IGYoKSk7XG4gICAgICAgICAgICAkUkFGUXVldWUubGVuZ3RoID0gMDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgICRSQUZRdWV1ZS5wdXNoKGZuKTtcbn07XG5cbmV4cG9ydCBjb25zdCBhcHBlbmROb2RlID0gKG5vZGU6IEhUTUxFbGVtZW50LCBwYXJlbnQ6IEhUTUxFbGVtZW50LCBzeW5jPzogYm9vbGVhbikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSAoKSA9PiBwYXJlbnQuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgc3luYyA/IHRhc2soKSA6IGludm9rZUxhdGVyKHRhc2spO1xufTtcblxuZXhwb3J0IGNvbnN0IGluc2VydEJlZm9yZSA9IChub2RlOiBIVE1MRWxlbWVudCwgcmVmOiBIVE1MRWxlbWVudCwgc3luYz86IGJvb2xlYW4pID0+IHtcbiAgICBjb25zdCB0YXNrID0gKCkgPT4gcmVmLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIHJlZik7XG4gICAgc3luYyA/IHRhc2soKSA6IGludm9rZUxhdGVyKHRhc2spO1xufTtcblxuZXhwb3J0IGNvbnN0IGluc2VydEFmdGVyID0gKG5vZGU6IEhUTUxFbGVtZW50LCByZWY6IEhUTUxFbGVtZW50LCBzeW5jPzogYm9vbGVhbikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSAoKSA9PiByZWYucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgcmVmLm5leHRTaWJsaW5nKTtcbiAgICBzeW5jID8gdGFzaygpIDogaW52b2tlTGF0ZXIodGFzayk7XG59O1xuXG5leHBvcnQgY29uc3QgcmVtb3ZlTm9kZSA9IChub2RlOiBIVE1MRWxlbWVudCwgc3luYz86IGJvb2xlYW4pID0+IHtcbiAgICBjb25zdCB0YXNrID0gKCkgPT4gbm9kZS5yZW1vdmUoKTtcbiAgICBzeW5jID8gdGFzaygpIDogaW52b2tlTGF0ZXIodGFzayk7XG59O1xuXG5leHBvcnQgY29uc3QgcmVtb3ZlQ2xhc3MgPSAobm9kZTogSFRNTEVsZW1lbnQsIG92OiBzdHJpbmcsIHN5bmM/OiBib29sZWFuKSA9PiB7XG4gICAgb3YgPSBvdiB8fCAnJztcbiAgICBjb25zdCB0YXNrID0gYyA9PiBub2RlLmNsYXNzTGlzdC5yZW1vdmUoYyk7XG4gICAgb3Yuc3BsaXQoJyAnKS5mb3JFYWNoKGMgPT4ge1xuICAgICAgICBpZiAoYy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHN5bmMgPyB0YXNrKGMpIDogaW52b2tlTGF0ZXIoKCkgPT4gdGFzayhjKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBhZGRDbGFzcyA9IChub2RlOiBIVE1MRWxlbWVudCwgbnY6IHN0cmluZywgc3luYz86IGJvb2xlYW4pID0+IHtcbiAgICBudiA9IG52IHx8ICcnO1xuICAgIGNvbnN0IHRhc2sgPSBjID0+IG5vZGUuY2xhc3NMaXN0LmFkZChjKTtcbiAgICBudi5zcGxpdCgnICcpLmZvckVhY2goYyA9PiB7XG4gICAgICAgIGlmIChjLmxlbmd0aCkge1xuICAgICAgICAgICAgc3luYyA/IHRhc2soYykgOiBpbnZva2VMYXRlcigoKSA9PiB0YXNrKGMpKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHN3aXRjaENsYXNzID0gKG5vZGU6IEhUTUxFbGVtZW50LCB0b0FkZDogc3RyaW5nID0gJycsIHRvUmVtb3ZlOiBzdHJpbmcgPSAnJywgc3luYz86IGJvb2xlYW4pID0+IHtcbiAgICByZW1vdmVDbGFzcyhub2RlLCB0b1JlbW92ZSwgc3luYyk7XG4gICAgYWRkQ2xhc3Mobm9kZSwgdG9BZGQsIHN5bmMpO1xufTtcblxuZXhwb3J0IGNvbnN0IHRvZ2dsZUNsYXNzID0gKG5vZGU6IEhUTUxFbGVtZW50LCBjbHM6IHN0cmluZywgY29uZGl0aW9uOiBib29sZWFuLCBzeW5jPzogYm9vbGVhbikgPT4ge1xuICAgIGlmIChjb25kaXRpb24pIHtcbiAgICAgICAgYWRkQ2xhc3Mobm9kZSwgY2xzLCBzeW5jKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZW1vdmVDbGFzcyhub2RlLCBjbHMsIHN5bmMpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzZXRDU1MgPSAobm9kZTogSFRNTEVsZW1lbnQsIGNzc05hbWU6IHN0cmluZywgdmFsPzogc3RyaW5nIHwgbnVtYmVyLCBzeW5jPzogYm9vbGVhbikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSAoKSA9PiBub2RlLnN0eWxlW2Nzc05hbWVdID0gdmFsO1xuICAgIHN5bmMgPyB0YXNrKCkgOiBpbnZva2VMYXRlcih0YXNrKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRDU1NGcm9tT2JqID0gKG5vZGU6IEhUTUxFbGVtZW50LCBjc3NPYmo6IGFueSwgc3luYz86IGJvb2xlYW4pID0+IHtcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoY3NzT2JqIHx8IHt9KTtcbiAgICBrZXlzLmZvckVhY2goa2V5ID0+IHNldENTUyhub2RlLCBrZXksIGNzc09ialtrZXldLCBzeW5jKSk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0UHJvcGVydHkgPSAobm9kZTogSFRNTEVsZW1lbnQsIHByb3BOYW1lOiBzdHJpbmcsIHZhbDogYW55LCBzeW5jPzogYm9vbGVhbikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSAoKSA9PiBub2RlW3Byb3BOYW1lXSA9IHZhbDtcbiAgICBzeW5jID8gdGFzaygpIDogaW52b2tlTGF0ZXIodGFzayk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0QXR0ciA9IChub2RlOiBIVE1MRWxlbWVudCwgYXR0ck5hbWU6IHN0cmluZywgdmFsOiBhbnksIHN5bmM/OiBib29sZWFuKSA9PiB7XG4gICAgY29uc3QgdGFzayA9ICgpID0+IG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50ICYmIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCB2YWwpO1xuICAgIHN5bmMgPyB0YXNrKCkgOiBpbnZva2VMYXRlcih0YXNrKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRIdG1sID0gKG5vZGU6IEhUTUxFbGVtZW50LCBodG1sOiBzdHJpbmcsIHN5bmM/OiBib29sZWFuKSA9PiB7XG4gICAgY29uc3QgdGFzayA9ICgpID0+IG5vZGUuaW5uZXJIVE1MID0gaHRtbDtcbiAgICBzeW5jID8gdGFzaygpIDogaW52b2tlTGF0ZXIodGFzayk7XG59O1xuXG5leHBvcnQgY29uc3QgcmVtb3ZlQXR0ciA9IChub2RlOiBIVE1MRWxlbWVudCwgYXR0ck5hbWU6IHN0cmluZywgc3luYz86IGJvb2xlYW4pID0+IHtcbiAgICBjb25zdCB0YXNrID0gKCkgPT4gbm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0ck5hbWUpO1xuICAgIHN5bmMgPyB0YXNrKCkgOiBpbnZva2VMYXRlcih0YXNrKTtcbn07XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVFbGVtZW50ID0gKG5vZGVUeXBlOiBzdHJpbmcsIGF0dHJzOiBhbnksIHN5bmM/OiBib29sZWFuKTogSFRNTEVsZW1lbnQgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGVUeXBlKTtcblxuICAgIGlmIChhdHRycykge1xuICAgICAgICBPYmplY3Qua2V5cyhhdHRycykuZm9yRWFjaChhdHRyTmFtZSA9PiB7XG4gICAgICAgICAgICBzZXRBdHRyKG5vZGUsIGF0dHJOYW1lLCBhdHRyc1thdHRyTmFtZV0sIHN5bmMpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG59O1xuXG4vLyBmb3Igd2lkdGggYW5kIGhlaWdodCBpZiBhIG51bWVyaWMgdmFsdWUgaXMgc3BlY2lmaWVkIHJldHVybiBpbiBweFxuLy8gZWxzZSByZXR1cm4gdGhlIHNhbWUgdmFsdWVcbmV4cG9ydCBjb25zdCB0b0RpbWVuc2lvbiA9ICh2OiBzdHJpbmcgfCBudW1iZXIpID0+IHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgaWYgKHYgPT0gK3YpIHtcbiAgICAgICAgcmV0dXJuIGAke3Z9cHhgO1xuICAgIH1cbiAgICByZXR1cm4gdjtcbn07XG4iXX0=