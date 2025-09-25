import React, { memo, useCallback, useMemo } from "react";
import { FlatList, StyleSheet, useWindowDimensions, Platform } from "react-native";

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  estimatedItemSize?: number;
  testID?: string;
  onScroll?: (event: any) => void;
  scrollEventThrottle?: number;
}



function VirtualizedList<T>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onRefresh,
  refreshing = false,
  loading = false,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  estimatedItemSize = 200,
  testID,
  onScroll,
  scrollEventThrottle = 16,
}: VirtualizedListProps<T>) {
  const { height: screenHeight } = useWindowDimensions();
  
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: estimatedItemSize,
      offset: estimatedItemSize * index,
      index,
    }),
    [estimatedItemSize]
  );
  
  const initialNumToRender = useMemo(() => {
    return Math.min(Math.ceil(screenHeight / estimatedItemSize) + 2, 10);
  }, [screenHeight, estimatedItemSize]);
  
  const maxToRenderPerBatch = Platform.OS === 'web' ? 5 : 10;
  const windowSize = Platform.OS === 'web' ? 3 : 5;

  // Custom pull-to-refresh implementation would go here
  // For now, we'll handle refresh through onEndReached or external controls

  const memoizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      return renderItem({ item, index });
    },
    [renderItem]
  );

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={maxToRenderPerBatch}
      updateCellsBatchingPeriod={Platform.OS === 'web' ? 100 : 50}
      initialNumToRender={initialNumToRender}
      windowSize={windowSize}
      disableVirtualization={Platform.OS === 'web' && data.length < 20}
      showsVerticalScrollIndicator={false}
      testID={testID}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

});

export default memo(VirtualizedList) as <T>(
  props: VirtualizedListProps<T>
) => React.ReactElement;