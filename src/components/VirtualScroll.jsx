import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

const VirtualScroll = ({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5,
  renderItem,
  className = '',
  style = {},
  onScroll = null,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // 計算可見範圍
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // 計算總高度
  const totalHeight = items.length * itemHeight;

  // 計算偏移量
  const offsetY = visibleRange.startIndex * itemHeight;

  // 可見項目
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // 處理滾動事件
  const handleScroll = useCallback(
    e => {
      const newScrollTop = e.target.scrollTop;
      setScrollTop(newScrollTop);

      if (onScroll) {
        onScroll(newScrollTop);
      }
    },
    [onScroll]
  );

  // 滾動到指定索引
  const scrollToIndex = useCallback(
    index => {
      if (containerRef.current) {
        const targetScrollTop = index * itemHeight;
        containerRef.current.scrollTop = targetScrollTop;
      }
    },
    [itemHeight]
  );

  // 滾動到頂部
  const scrollToTop = useCallback(() => {
    scrollToIndex(0);
  }, [scrollToIndex]);

  // 滾動到底部
  const scrollToBottom = useCallback(() => {
    scrollToIndex(items.length - 1);
  }, [scrollToIndex, items.length]);

  return (
    <div
      ref={containerRef}
      className={`virtual-scroll-container ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        ...style,
      }}
      onScroll={handleScroll}
      {...props}
    >
      {/* 總高度佔位符 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* 可見項目容器 */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div
                key={actualIndex}
                style={{
                  height: itemHeight,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

VirtualScroll.propTypes = {
  items: PropTypes.array.isRequired,
  itemHeight: PropTypes.number,
  containerHeight: PropTypes.number,
  overscan: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  onScroll: PropTypes.func,
};

export default React.memo(VirtualScroll);
