import { StyleSheet, Text, View, FlatList, Platform } from 'react-native';

export default function UserDashboardScreen() {

  // ✅ Create plain data (not JSX)
  const data = Array.from({ length: 100 }, (_, index) => ({
    id: index.toString(),
    title: `Item ${index + 1}`,
  }));

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f2f2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});