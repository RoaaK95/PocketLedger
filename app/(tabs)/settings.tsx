import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { signOut } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { ActionSheetIOS, Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SalaryReminderSettings } from "../../components/ui/salary-reminder-settings";
import { auth } from "../../firebase/config";
import { loadUserProfileFromFirebase } from "../../firebase/sync";
import { useAuth } from "../../hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [salaryReminderVisible, setSalaryReminderVisible] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [currency, setCurrency] = useState("IQD");

  const loadUserName = useCallback(async () => {
    if (!user) return;
    
    console.log("Loading user name for:", user.uid);
    console.log("User displayName from auth:", user.displayName);
    
    try {
      // First try to get from local storage
      let storedName = await AsyncStorage.getItem(`user_name_${user.uid}`);
      console.log("Stored name from AsyncStorage:", storedName);
      
      // If not in local storage, try to load from Firebase
      if (!storedName) {
        console.log("No stored name, trying Firebase...");
        storedName = await loadUserProfileFromFirebase(user.uid);
        console.log("Name from Firebase:", storedName);
      }
      
      const finalName = storedName || user.displayName || "";
      console.log("Final display name:", finalName);
      setDisplayName(finalName);

      // Load profile image
      const storedImage = await AsyncStorage.getItem(`user_image_${user.uid}`);
      if (storedImage) {
        setProfileImage(storedImage);
      }

      // Load currency
      const storedCurrency = await AsyncStorage.getItem(`user_currency_${user.uid}`);
      if (storedCurrency) {
        setCurrency(storedCurrency);
      }
    } catch (error) {
      console.error("Error loading name:", error);
      setDisplayName(user.displayName || "");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserName();
    }
  }, [user, loadUserName]);

  const handleOpenModal = () => {
    loadUserName(); // Reload name when opening modal
    setModalVisible(true);
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'IQD', name: 'Iraqi Dinar', symbol: 'IQD' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KWD' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR' },
    { code: 'OMR', name: 'Omani Rial', symbol: 'OMR' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BHD' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JOD' },
    { code: 'LBP', name: 'Lebanese Pound', symbol: 'LBP' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'EGP' },
  ];

  const handleCurrencySelect = async (currencyCode: string) => {
    if (!user) return;
    
    try {
      setCurrency(currencyCode);
      await AsyncStorage.setItem(`user_currency_${user.uid}`, currencyCode);
      await AsyncStorage.setItem(`user_currency_pending_sync_${user.uid}`, 'true');
      setCurrencyModalVisible(false);
    } catch (error) {
      console.error("Error saving currency:", error);
      Alert.alert("Error", "Failed to save currency. Please try again.");
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      if (user) {
        await AsyncStorage.setItem(`user_image_${user.uid}`, imageUri);
        await AsyncStorage.setItem(`user_image_pending_sync_${user.uid}`, 'true');
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      if (user) {
        await AsyncStorage.setItem(`user_image_${user.uid}`, imageUri);
        await AsyncStorage.setItem(`user_image_pending_sync_${user.uid}`, 'true');
      }
    }
  };

  const handleImagePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex: number) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          }
        }
      );
    } else {
      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Library', onPress: pickImageFromGallery },
        ],
        { cancelable: true }
      );
    }
  };

  const handleSaveName = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      await AsyncStorage.setItem(`user_name_${user.uid}`, displayName);
      await AsyncStorage.setItem(`user_name_pending_sync_${user.uid}`, 'true');
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving name:", error);
      Alert.alert("Error", "Failed to save name. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="settings" size={48} color="#4CAF50" />
          </View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <Pressable style={styles.settingItem} onPress={handleOpenModal}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.settingIcon} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </Pressable>

          
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <Pressable style={styles.settingItem} onPress={() => setCurrencyModalVisible(true)}>
            <Ionicons name="cash-outline" size={20} color="#666" style={styles.settingIcon} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Currency</Text>
              <Text style={styles.settingValue}>{currency}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <Pressable style={styles.settingItem} onPress={() => setSalaryReminderVisible(true)}>
            <Ionicons name="notifications-outline" size={20} color="#666" style={styles.settingIcon} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Salary Reminder</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </Pressable>
        </View>

        <Pressable 
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={20} color="white" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Information</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.profileIconContainer}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="person-circle" size={80} color="#4CAF50" />
                )}
                <Pressable style={styles.addPhotoButton} onPress={handleImagePicker}>
                  <Ionicons name="add-circle" size={32} color="#4CAF50" />
                </Pressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.editableInput}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.readonlyInput}
                  value={user?.email || ""}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveName}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Saving..." : "Save"}
                </Text>
              </Pressable>
              
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={currencyModalVisible}
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <Pressable onPress={() => setCurrencyModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </Pressable>
            </View>

            <ScrollView style={styles.currencyList}>
              {currencies.map((curr) => (
                <Pressable
                  key={curr.code}
                  style={[
                    styles.currencyItem,
                    currency === curr.code && styles.currencyItemSelected
                  ]}
                  onPress={() => handleCurrencySelect(curr.code)}
                >
                  <View style={styles.currencyInfo}>
                    <Text style={[
                      styles.currencyCode,
                      currency === curr.code && styles.currencyCodeSelected
                    ]}>
                      {curr.code}
                    </Text>
                    <Text style={styles.currencyName}>{curr.name}</Text>
                  </View>
                  {currency === curr.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Salary Reminder Settings Modal */}
      <SalaryReminderSettings
        visible={salaryReminderVisible}
        onClose={() => setSalaryReminderVisible(false)}
        userId={user?.uid || ""}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 24,
    paddingTop:80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalBody: {
    marginBottom: 24,
  },
  profileIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
  },
  addPhotoButton: {
    position: 'absolute',
    bottom: -5,
    right: '35%',
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  readonlyInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#666',
  },
  editableInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  currencyList: {
    maxHeight: 400,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currencyItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  currencyCodeSelected: {
    color: '#4CAF50',
  },
  currencyName: {
    fontSize: 14,
    color: '#666',
  },
  settingSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
});

// Add Salary Reminder Modal before the closing tags

