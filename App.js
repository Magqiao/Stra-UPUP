import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Platform, Modal, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const App = () => {
  const [selectedTab, setSelectedTab] = useState('预案');
  const [plan, setPlan] = useState({
    date: new Date().toISOString().split('T')[0],
    dimensions: {
      countryWill: '',
      news: '',
      capitalType: '',
      market: '',
      sector: ''
    },
    stock: '',
    buy: {
      method: '',
      conditions: '',
      position: ''
    },
    sell: {
      method: '',
      conditions: ''
    },
    notes: ''
  });
  const [plans, setPlans] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 维度选项
  const dimensionOptions = {
    countryWill: ['维护', '打压'],
    news: ['利好消息', '利空消息'],
    capitalType: ['量化（技术派）', '散户', '游资'],
    market: ['上升', '震荡', '下跌'],
    sector: ['上升', '震荡', '下跌']
  };

  // 买入方式选项
  const buyMethodOptions = ['分仓', '聚焦'];

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
      dimensions: {
        countryWill: '',
        news: '',
        capitalType: '',
        market: '',
        sector: ''
      },
      stock: '',
      buy: {
        method: '',
        conditions: '',
        position: ''
      },
      sell: {
        method: '',
        conditions: ''
      },
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

  const handleDimensionChange = (dimension, value) => {
    setPlan({
      ...plan,
      dimensions: {
        ...plan.dimensions,
        [dimension]: value
      }
    });
  };

  const handleDimensionInput = (dimension, value) => {
    setPlan({
      ...plan,
      dimensions: {
        ...plan.dimensions,
        [dimension]: value
      }
    });
  };

  const handleBuyChange = (field, value) => {
    setPlan({
      ...plan,
      buy: {
        ...plan.buy,
        [field]: value
      }
    });
  };

  const handleBuyInput = (field, value) => {
    setPlan({
      ...plan,
      buy: {
        ...plan.buy,
        [field]: value
      }
    });
  };

  const handleSellChange = (field, value) => {
    setPlan({
      ...plan,
      sell: {
        ...plan.sell,
        [field]: value
      }
    });
  };

  const handleSellInput = (field, value) => {
    setPlan({
      ...plan,
      sell: {
        ...plan.sell,
        [field]: value
      }
    });
  };

  const generateDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setPlan({
      ...plan,
      date: formattedDate
    });
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
              <View style={styles.dateContainer}>
                <TextInput 
                  style={[styles.input, styles.dateInput]} 
                  value={plan.date} 
                  onChangeText={(text) => setPlan({...plan, date: text})}
                />
                <TouchableOpacity style={styles.dateButton} onPress={generateDate}>
                  <Text style={styles.dateButtonText}>生成当日</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 维度选择 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>考虑维度</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>国家意志</Text>
                <View style={styles.optionContainer}>
                  {dimensionOptions.countryWill.map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.optionButton,
                        plan.dimensions.countryWill === option && styles.selectedOption
                      ]}
                      onPress={() => handleDimensionChange('countryWill', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        plan.dimensions.countryWill === option && styles.selectedOptionText
                      ]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput 
                  style={styles.input} 
                  value={plan.dimensions.countryWill} 
                  onChangeText={(text) => handleDimensionInput('countryWill', text)}
                  placeholder="或输入自定义值"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>消息面</Text>
                <View style={styles.optionContainer}>
                  {dimensionOptions.news.map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.optionButton,
                        plan.dimensions.news === option && styles.selectedOption
                      ]}
                      onPress={() => handleDimensionChange('news', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        plan.dimensions.news === option && styles.selectedOptionText
                      ]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput 
                  style={styles.input} 
                  value={plan.dimensions.news} 
                  onChangeText={(text) => handleDimensionInput('news', text)}
                  placeholder="或输入自定义值"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>资金类型（对手盘）</Text>
                <View style={styles.optionContainer}>
                  {dimensionOptions.capitalType.map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.optionButton,
                        plan.dimensions.capitalType === option && styles.selectedOption
                      ]}
                      onPress={() => handleDimensionChange('capitalType', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        plan.dimensions.capitalType === option && styles.selectedOptionText
                      ]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput 
                  style={styles.input} 
                  value={plan.dimensions.capitalType} 
                  onChangeText={(text) => handleDimensionInput('capitalType', text)}
                  placeholder="或输入自定义值"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>大盘</Text>
                <View style={styles.optionContainer}>
                  {dimensionOptions.market.map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.optionButton,
                        plan.dimensions.market === option && styles.selectedOption
                      ]}
                      onPress={() => handleDimensionChange('market', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        plan.dimensions.market === option && styles.selectedOptionText
                      ]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput 
                  style={styles.input} 
                  value={plan.dimensions.market} 
                  onChangeText={(text) => handleDimensionInput('market', text)}
                  placeholder="或输入自定义值"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>板块</Text>
                <View style={styles.optionContainer}>
                  {dimensionOptions.sector.map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.optionButton,
                        plan.dimensions.sector === option && styles.selectedOption
                      ]}
                      onPress={() => handleDimensionChange('sector', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        plan.dimensions.sector === option && styles.selectedOptionText
                      ]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput 
                  style={styles.input} 
                  value={plan.dimensions.sector} 
                  onChangeText={(text) => handleDimensionInput('sector', text)}
                  placeholder="或输入自定义值"
                />
              </View>
            </View>

            {/* 个股信息 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>个股</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>股票代码/名称</Text>
                <TextInput 
                  style={styles.input} 
                  value={plan.stock} 
                  onChangeText={(text) => setPlan({...plan, stock: text})}
                  placeholder="输入股票代码或名称"
                />
              </View>
            </View>

            {/* 买入策略 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>买入</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>买入方式</Text>
                <View style={styles.optionContainer}>
                  {buyMethodOptions.map((option, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[
                        styles.optionButton,
                        plan.buy.method === option && styles.selectedOption
                      ]}
                      onPress={() => handleBuyChange('method', option)}
                    >
                      <Text style={[
                        styles.optionText,
                        plan.buy.method === option && styles.selectedOptionText
                      ]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput 
                  style={styles.input} 
                  value={plan.buy.method} 
                  onChangeText={(text) => handleBuyInput('method', text)}
                  placeholder="或输入自定义值"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>仓位</Text>
                <TextInput 
                  style={styles.input} 
                  value={plan.buy.position} 
                  onChangeText={(text) => handleBuyChange('position', text)}
                  placeholder="如：1/5 或 3/5"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>买入条件</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  value={plan.buy.conditions} 
                  onChangeText={(text) => handleBuyChange('conditions', text)}
                  placeholder="买入时机、价格区间、量能要求等"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* 卖出策略 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>卖出</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>卖出方式</Text>
                <TextInput 
                  style={styles.input} 
                  value={plan.sell.method} 
                  onChangeText={(text) => handleSellChange('method', text)}
                  placeholder="如：止盈、止损、分批卖出等"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>卖出条件</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  value={plan.sell.conditions} 
                  onChangeText={(text) => handleSellChange('conditions', text)}
                  placeholder="止盈点、止损点、形态变化等"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* 备注 */}
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
                  <Text style={styles.planSummary}>买入条件: {item.buy.conditions.substring(0, 50)}...</Text>
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
  // 新增样式
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    marginRight: 10,
  },
  dateButton: {
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#1E90FF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default App;