import React, { memo, useCallback } from "react";
import { FlatList, View, StyleSheet, useWindowDimensions } from "react-native";

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

  // Custom pull-to-refresh implementation would go here
  // For now, we'll handle refresh through onEndReached or external controls

  const memoizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      return <View style={styles.itemContainer}>{renderItem({ item, index })}</View>;
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

      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={Math.ceil(screenHeight / estimatedItemSize)}
      windowSize={5}
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
  itemContainer: {
    flex: 1,
  },
});

export default memo(VirtualizedList) as <T>(
  props: VirtualizedListProps<T>
) => React.ReactElement;