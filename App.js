import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const App = () => {
  const [selectedTab, setSelectedTab] = useState('预案');
  const [plan, setPlan] = useState({
    date: new Date().toISOString().split('T')[0],
    countryWill: '',
    news: '',
    capitalType: '',
    market: '',
    sector: '',
    stock: '',
    buyConditions: '',
    sellConditions: '',
    notes: ''
  });
  const [plans, setPlans] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const handleSave = () => {
    if (isEditing) {
      const updatedPlans = [...plans];
      updatedPlans[editingIndex] = plan;
      setPlans(updatedPlans);
    } else {
      setPlans([...plans, plan]);
    }
    setPlan({
      date: new Date().toISOString().split('T')[0],
      countryWill: '',
      news: '',
      capitalType: '',
      market: '',
      sector: '',
      stock: '',
      buyConditions: '',
      sellConditions: '',
      notes: ''
    });
    setIsEditing(false);
    setEditingIndex(-1);
  };

  const handleEdit = (index) => {
    setPlan(plans[index]);
    setIsEditing(true);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const updatedPlans = plans.filter((_, i) => i !== index);
    setPlans(updatedPlans);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>A股交易预案</Text>
      </View>

      {/* 标签切换 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === '预案' && styles.activeTab]} 
          onPress={() => setSelectedTab('预案')}
        >
          <Text style={[styles.tabText, selectedTab === '预案' && styles.activeTabText]}>新建预案</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === '历史' && styles.activeTab]} 
          onPress={() => setSelectedTab('历史')}
        >
          <Text style={[styles.tabText, selectedTab === '历史' && styles.activeTabText]}>历史预案</Text>
        </TouchableOpacity>
      </View>

      {/* 内容区域 */}
      <ScrollView style={styles.content}>
        {selectedTab === '预案' ? (
          <View style={styles.form}>
            <Text style={styles.formTitle}>交易预案</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>日期</Text>
              <TextInput 
                style={styles.input} 
                value={plan.date} 
                onChangeText={(text) => setPlan({...plan, date: text})}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>国家意志</Text>
              <TextInput 
                style={styles.input} 
                value={plan.countryWill} 
                onChangeText={(text) => setPlan({...plan, countryWill: text})}
                placeholder="政策方向、监管动态等"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>消息面</Text>
              <TextInput 
                style={styles.input} 
                value={plan.news} 
                onChangeText={(text) => setPlan({...plan, news: text})}
                placeholder="行业新闻、公司公告等"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>资金类型（对手盘）</Text>
              <TextInput 
                style={styles.input} 
                value={plan.capitalType} 
                onChangeText={(text) => setPlan({...plan, capitalType: text})}
                placeholder="主力资金、游资、散户等"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>大盘</Text>
              <TextInput 
                style={styles.input} 
                value={plan.market} 
                onChangeText={(text) => setPlan({...plan, market: text})}
                placeholder="大盘走势、量能等"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>板块</Text>
              <TextInput 
                style={styles.input} 
                value={plan.sector} 
                onChangeText={(text) => setPlan({...plan, sector: text})}
                placeholder="热点板块、板块轮动等"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>个股</Text>
              <TextInput 
                style={styles.input} 
                value={plan.stock} 
                onChangeText={(text) => setPlan({...plan, stock: text})}
                placeholder="股票代码、名称、技术形态等"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>买入条件</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={plan.buyConditions} 
                onChangeText={(text) => setPlan({...plan, buyConditions: text})}
                placeholder="买入时机、价格区间、量能要求等"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>卖出条件</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={plan.sellConditions} 
                onChangeText={(text) => setPlan({...plan, sellConditions: text})}
                placeholder="止盈点、止损点、形态变化等"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>备注</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={plan.notes} 
                onChangeText={(text) => setPlan({...plan, notes: text})}
                placeholder="其他需要记录的信息"
                multiline
                numberOfLines={2}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{isEditing ? '更新预案' : '保存预案'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.history}>
            <Text style={styles.historyTitle}>历史预案</Text>
            {plans.length === 0 ? (
              <Text style={styles.emptyText}>暂无历史预案</Text>
            ) : (
              plans.map((item, index) => (
                <View key={index} style={styles.planCard}>
                  <Text style={styles.planDate}>{item.date}</Text>
                  <Text style={styles.planStock}>{item.stock}</Text>
                  <Text style={styles.planSummary}>{item.buyConditions.substring(0, 50)}...</Text>
                  <View style={styles.planActions}>
                    <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(index)}>
                      <Text style={styles.editButtonText}>编辑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(index)}>
                      <Text style={styles.deleteButtonText}>删除</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1E90FF',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1E90FF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#1E90FF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  history: {
    padding: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 50,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  planDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  planStock: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  planSummary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    padding: 8,
    marginRight: 10,
  },
  editButtonText: {
    color: '#1E90FF',
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#ff4444',
    fontSize: 14,
  },
});

export default App;