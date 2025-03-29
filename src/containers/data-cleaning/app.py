# containers/data-cleaning/app.py
import json
import pandas as pd
import numpy as np
import os

print("Starting data cleaning task...")

# Read input
with open('/app/input.json', 'r') as f:
    input_data = json.load(f)

# Extract request
request = input_data.get('rawRequest', '')
print(f"Processing request: {request}")

# For demonstration, we'll create a sample dataset with issues
def create_sample_dataset():
    np.random.seed(42)
    
    # Create a dataframe with missing values, duplicates, and outliers
    data = {
        'id': range(1, 101),
        'value': np.random.normal(100, 15, 100),
        'category': np.random.choice(['A', 'B', 'C', None], 100),
        'date': pd.date_range(start='2023-01-01', periods=100)
    }
    
    df = pd.DataFrame(data)
    
    # Add some NaN values
    df.loc[np.random.choice(df.index, 10), 'value'] = np.nan
    
    # Add some duplicate rows
    duplicates = df.sample(5)
    df = pd.concat([df, duplicates]).reset_index(drop=True)
    
    # Add some outliers
    df.loc[np.random.choice(df.index, 3), 'value'] = 1000
    
    return df

# Create and clean the dataset
df = create_sample_dataset()
print(f"Created sample dataset with shape: {df.shape}")

# Perform cleaning operations
print("Performing data cleaning operations...")

# Remove duplicates
df_clean = df.drop_duplicates()
print(f"Removed {df.shape[0] - df_clean.shape[0]} duplicate rows")

# Handle missing values
df_clean['value'] = df_clean['value'].fillna(df_clean['value'].mean())
df_clean['category'] = df_clean['category'].fillna('Unknown')
print("Filled missing values")

# Handle outliers (simple Z-score method)
z_scores = np.abs((df_clean['value'] - df_clean['value'].mean()) / df_clean['value'].std())
df_clean = df_clean[z_scores < 3]
print(f"Removed {sum(z_scores >= 3)} outliers")

# Basic statistics after cleaning
stats = {
    'row_count': len(df_clean),
    'column_count': len(df_clean.columns),
    'value_mean': float(df_clean['value'].mean()),
    'value_std': float(df_clean['value'].std()),
    'category_counts': df_clean['category'].value_counts().to_dict()
}

# Create output
output = {
    'message': 'Data cleaning completed successfully',
    'cleaned_rows': len(df_clean),
    'original_rows': len(df),
    'statistics': stats,
    'sample_data': df_clean.head(5).to_dict(orient='records')
}

# Write output
with open('/app/output.json', 'w') as f:
    json.dump(output, f)

print("Data cleaning task completed")