import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';

const RenderItem = ({ item }) => {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.itemContainer, { width, height, backgroundColor: item.backgroundColor }]}>
      <Image source={item.image} style={styles.image} />
      <Text style={[styles.title, { color: item.textColor }]}>{item.title}</Text>
      <Text style={[styles.description, { color: item.textColor }]}>{item.text}</Text>
    </View>
  );
};

export default RenderItem;

const styles = StyleSheet.create({
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 10,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
  },
});
