'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

export default function WordCloud({ words, width = 600, height = 400 }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!words || words.length === 0) return;

    // 清除现有的SVG内容
    d3.select(svgRef.current).selectAll("*").remove();

    // 设置颜色比例尺
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    
    // 计算字体大小范围
    const minCount = d3.min(words, d => d.value);
    const maxCount = d3.max(words, d => d.value);
    const fontSize = d3.scaleLog()
      .domain([minCount, maxCount])
      .range([14, 50]);

    // 配置词云布局
    const layout = cloud()
      .size([width, height])
      .words(words.map(d => ({
        text: d.text,
        size: fontSize(d.value)
      })))
      .padding(5)
      .rotate(() => 0)
      .font("Impact")
      .fontSize(d => d.size)
      .on("end", draw);

    // 开始布局计算
    layout.start();

    // 绘制词云
    function draw(words) {
      d3.select(svgRef.current)
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
        .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", d => d.size + "px")
        .style("font-family", "Impact")
        .style("fill", (d, i) => color(i))
        .attr("text-anchor", "middle")
        .attr("transform", d => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
        .text(d => d.text)
        .style("cursor", "pointer")
        .on("mouseover", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 0.7);
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1);
        });
    }
  }, [words, width, height]);

  return (
    <div className="w-full flex justify-center">
      <svg ref={svgRef} className="max-w-full"></svg>
    </div>
  );
}
