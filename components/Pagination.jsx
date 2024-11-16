import React from 'react';
import { View, StyleSheet } from 'react-native';
import Dot from './Dot';

const Pagination = ({ data, buttonVal }) => {
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, index) => (
        <Dot key={index} index={index} buttonVal={buttonVal} />
      ))}
    </View>
  );
};

export default Pagination;

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 70, // Yeri biraz yukarıya aldım
  },
});
