package com.klucampus.app

import android.app.Application
import android.content.res.Configuration

import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
    override fun getPackages(): List<ReactPackage> {
      // Return empty list for now - autolinking will handle packages
      return emptyList()
    }

    override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

    override val isNewArchEnabled: Boolean = false
    override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
  }

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
  }
}