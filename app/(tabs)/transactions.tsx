import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { listTxs, Tx } from "../../db/transactionsRepo";
import { useAuth } from "../../hooks/useAuth";

type Category = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const EXPENSE_CATEGORIES: Category[] = [
  { id: "food", name: "Food & Dining", icon: "restaurant" },
  { id: "transport", name: "Transportation", icon: "car" },
  { id: "shopping", name: "Shopping", icon: "cart" },
  { id: "entertainment", name: "Entertainment", icon: "game-controller" },
  { id: "bills", name: "Bills & Utilities", icon: "receipt" },
  { id: "health", name: "Health", icon: "medical" },
  { id: "education", name: "Education", icon: "school" },
  { id: "general", name: "General", icon: "folder" },
];

const INCOME_CATEGORIES: Category[] = [
  { id: "salary", name: "Salary", icon: "wallet" },
  { id: "business", name: "Business", icon: "briefcase" },
  { id: "investment", name: "Investment", icon: "trending-up" },
  { id: "gift", name: "Gift", icon: "gift" },
  { id: "other", name: "Other", icon: "cash" },
];

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export default function Transactions() {
  const { user } = useAuth();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [currency, setCurrency] = useState("IQD");

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setTxs(listTxs(user.uid));

      // Load currency
      AsyncStorage.getItem(`user_currency_${user.uid}`)
        .then((storedCurrency) => {
          if (storedCurrency) {
            setCurrency(storedCurrency);
          }
        })
        .catch((error) => {
          console.error("Error loading currency:", error);
        });
    }, [user])
  );

  // Memoized filtered transactions for performance
  const filteredTxs = useMemo(() => {
    return txs.filter((tx) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        tx.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.amount.toString().includes(searchQuery);

      // Type filter
      const matchesType = filterType === "all" || tx.type === filterType;

      // Category filter
      const matchesCategory =
        !filterCategory || tx.categoryId === filterCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [txs, searchQuery, filterType, filterCategory]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterCategory(null);
  };

  const hasActiveFilters =
    searchQuery !== "" || filterType !== "all" || filterCategory !== null;

  const getCategoryName = (categoryId: string): string => {
    const category = ALL_CATEGORIES.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="receipt" size={48} color="#4CAF50" />
        </View>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>Track all your financial activities</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== "" && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </Pressable>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={styles.filtersScrollView}
      >
        {/* Type Filters */}
        <Pressable
          onPress={() => {
            setFilterType("all");
            setFilterCategory(null);
          }}
          style={[
            styles.filterChip,
            filterType === "all" && styles.filterChipActive,
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              filterType === "all" && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilterType("income")}
          style={[
            styles.filterChip,
            filterType === "income" && styles.filterChipActiveIncome,
          ]}
        >
          <Ionicons
            name="arrow-up-circle"
            size={16}
            color={filterType === "income" ? "#fff" : "#4CAF50"}
          />
          <Text
            style={[
              styles.filterChipText,
              filterType === "income" && styles.filterChipTextActive,
            ]}
          >
            Income
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilterType("expense")}
          style={[
            styles.filterChip,
            filterType === "expense" && styles.filterChipActiveExpense,
          ]}
        >
          <Ionicons
            name="arrow-down-circle"
            size={16}
            color={filterType === "expense" ? "#fff" : "#f44336"}
          />
          <Text
            style={[
              styles.filterChipText,
              filterType === "expense" && styles.filterChipTextActive,
            ]}
          >
            Expense
          </Text>
        </Pressable>

        {/* Category Filters - show based on selected type */}
        {(filterType === "all" || filterType === "expense") &&
          EXPENSE_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() =>
                setFilterCategory(filterCategory === cat.id ? null : cat.id)
              }
              style={[
                styles.filterChip,
                filterCategory === cat.id && styles.filterChipActive,
              ]}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={filterCategory === cat.id ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.filterChipText,
                  filterCategory === cat.id && styles.filterChipTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}

        {(filterType === "all" || filterType === "income") &&
          INCOME_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() =>
                setFilterCategory(filterCategory === cat.id ? null : cat.id)
              }
              style={[
                styles.filterChip,
                filterCategory === cat.id && styles.filterChipActive,
              ]}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={filterCategory === cat.id ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.filterChipText,
                  filterCategory === cat.id && styles.filterChipTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Pressable onPress={clearFilters} style={styles.clearButton}>
            <Ionicons name="close" size={14} color="#f44336" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Results Count */}
      {hasActiveFilters && (
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            {filteredTxs.length}{" "}
            {filteredTxs.length === 1 ? "result" : "results"} found
          </Text>
        </View>
      )}

      {/* Transaction List */}
      {txs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to add your first transaction
          </Text>
        </View>
      ) : filteredTxs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search or filters
          </Text>
          {hasActiveFilters && (
            <Pressable onPress={clearFilters} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Clear Filters</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredTxs}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/view-transaction?id=${item.id}`)}
              style={styles.transactionCard}
            >
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={
                    item.type === "income"
                      ? "arrow-up-circle"
                      : "arrow-down-circle"
                  }
                  size={32}
                  color={item.type === "income" ? "#4CAF50" : "#f44336"}
                />
              </View>
              <View style={styles.transactionContent}>
                <Text style={styles.transactionAmount}>
                  {item.type === "income" ? "+" : "-"}
                  {item.amount} {currency}
                </Text>
                <Text style={styles.transactionNote} numberOfLines={1}>
                  {item.note || "No note"}
                </Text>
                <View style={styles.transactionMeta}>
                  <Ionicons name="pricetag-outline" size={12} color="#999" />
                  <Text style={styles.transactionCategory}>
                    {getCategoryName(item.categoryId)}
                  </Text>
                  <Text style={styles.metaDivider}>•</Text>
                  <Ionicons name="calendar-outline" size={12} color="#999" />
                  <Text style={styles.transactionDate}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </Pressable>
          )}
        />
      )}

      <Pressable
        onPress={() => router.push("/add-transaction")}
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: "#f5f5f5",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
  },
  filtersScrollView: {
    maxHeight: 65,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#ffff",
    borderWidth: 1.5,
    borderColor: "#dee2e6",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  filterChipActiveIncome: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  filterChipActiveExpense: {
    backgroundColor: "#f44336",
    borderColor: "#f44336",
  },
  filterChipText: {
    fontSize: 14,
    color: "#212529",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  filterChipTextActive: {
    color: "white",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 8,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#f44336",
  },
  clearButtonText: {
    fontSize: 13,
    color: "#f44336",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  resultsBar: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: "#f5f5f5",
  },
  resultsText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  resetButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
  },
  resetButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 16,
    marginBottom: 12,
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  transactionNote: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  transactionCategory: {
    fontSize: 12,
    color: "#999",
  },
  metaDivider: {
    fontSize: 12,
    color: "#ccc",
    marginHorizontal: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#999",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
